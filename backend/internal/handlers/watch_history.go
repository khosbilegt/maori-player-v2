package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"video-player-backend/internal/database"
	"video-player-backend/internal/errors"
	"video-player-backend/internal/models"
	"video-player-backend/internal/utils"
	"video-player-backend/internal/validation"
)

// WatchHistoryHandler handles watch history operations
type WatchHistoryHandler struct {
	watchHistoryRepo database.WatchHistoryRepository
	videoRepo        database.VideoRepository
}

// NewWatchHistoryHandler creates a new watch history handler
func NewWatchHistoryHandler(watchHistoryRepo database.WatchHistoryRepository, videoRepo database.VideoRepository) *WatchHistoryHandler {
	return &WatchHistoryHandler{
		watchHistoryRepo: watchHistoryRepo,
		videoRepo:        videoRepo,
	}
}

// GetWatchHistory retrieves all watch history for the authenticated user
func (h *WatchHistoryHandler) GetWatchHistory(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		errors.WriteErrorResponse(w, errors.ErrUnauthorized)
		return
	}

	log.Print("User ID", userID)

	watchHistories, err := h.watchHistoryRepo.GetByUserID(ctx, userID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Ensure we always have a slice, even if empty
	if watchHistories == nil {
		watchHistories = []*models.WatchHistory{}
	}

	// Convert to response format
	responses := make([]*models.WatchHistoryResponse, 0, len(watchHistories))
	for _, wh := range watchHistories {
		responses = append(responses, wh.ToResponse())
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": responses,
	})
}

// GetWatchHistoryByVideo retrieves watch history for a specific video
func (h *WatchHistoryHandler) GetWatchHistoryByVideo(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	// Get user ID from context
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		errors.WriteErrorResponse(w, errors.ErrUnauthorized)
		return
	}

	// Get video ID from URL path
	videoID := r.URL.Query().Get("video_id")
	if videoID == "" {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	watchHistory, err := h.watchHistoryRepo.GetByUserAndVideo(ctx, userID, videoID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrWatchHistoryNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": watchHistory.ToResponse(),
	})
}

// CreateOrUpdateWatchHistory creates or updates watch history for a video
func (h *WatchHistoryHandler) CreateOrUpdateWatchHistory(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	// Get user ID from context
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		errors.WriteErrorResponse(w, errors.ErrUnauthorized)
		return
	}

	var req models.WatchHistoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Validate request
	if ve := validation.ValidateWatchHistoryRequest(&req); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	// Check if video exists
	_, err := h.videoRepo.GetByID(ctx, req.VideoID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrVideoNotFound)
		return
	}

	// Check if watch history already exists
	existingHistory, err := h.watchHistoryRepo.GetByUserAndVideo(ctx, userID, req.VideoID)
	log.Print("Existing history", existingHistory)
	if err != nil {
		// Watch history doesn't exist, create new one
		watchHistory, err := req.ToWatchHistory(userID)
		if err != nil {
			errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
			return
		}

		if err := h.watchHistoryRepo.Create(ctx, watchHistory); err != nil {
			errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"data": watchHistory.ToResponse(),
		})
		return
	}

	// Update existing watch history
	if err := existingHistory.UpdateFromRequest(&req); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	if err := h.watchHistoryRepo.Update(ctx, existingHistory.ID.Hex(), existingHistory); err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": existingHistory.ToResponse(),
	})
}

// DeleteWatchHistory deletes watch history for a specific video
func (h *WatchHistoryHandler) DeleteWatchHistory(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	// Get user ID from context
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		errors.WriteErrorResponse(w, errors.ErrUnauthorized)
		return
	}

	// Get video ID from URL path
	videoID := r.URL.Query().Get("video_id")
	if videoID == "" {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	err := h.watchHistoryRepo.DeleteByUserAndVideo(ctx, userID, videoID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrWatchHistoryNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetRecentWatched retrieves recently watched videos
func (h *WatchHistoryHandler) GetRecentWatched(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	// Get user ID from context
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		errors.WriteErrorResponse(w, errors.ErrUnauthorized)
		return
	}

	// Get limit from query parameter (default to 10)
	limitStr := r.URL.Query().Get("limit")
	limit := 10
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	watchHistories, err := h.watchHistoryRepo.GetRecentWatched(ctx, userID, limit)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Convert to response format
	var responses []*models.WatchHistoryResponse
	for _, wh := range watchHistories {
		responses = append(responses, wh.ToResponse())
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": responses,
	})
}

// GetCompletedVideos retrieves completed videos
func (h *WatchHistoryHandler) GetCompletedVideos(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	// Get user ID from context
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		errors.WriteErrorResponse(w, errors.ErrUnauthorized)
		return
	}

	watchHistories, err := h.watchHistoryRepo.GetCompletedVideos(ctx, userID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Convert to response format
	var responses []*models.WatchHistoryResponse
	for _, wh := range watchHistories {
		responses = append(responses, wh.ToResponse())
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": responses,
	})
}
