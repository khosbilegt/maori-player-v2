package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"video-player-backend/internal/database"
	"video-player-backend/internal/errors"
	"video-player-backend/internal/models"

	"github.com/gorilla/mux"
)

// PlaylistHandler handles playlist-related HTTP requests
type PlaylistHandler struct {
	playlistRepo database.PlaylistRepository
	videoRepo    database.VideoRepository
}

// NewPlaylistHandler creates a new playlist handler
func NewPlaylistHandler(playlistRepo database.PlaylistRepository, videoRepo database.VideoRepository) *PlaylistHandler {
	return &PlaylistHandler{
		playlistRepo: playlistRepo,
		videoRepo:    videoRepo,
	}
}

// getUserIDFromContext extracts user ID from request context
func getUserIDFromContext(ctx context.Context) string {
	if userID, ok := ctx.Value("user_id").(string); ok {
		return userID
	}
	return ""
}

// GetPlaylists retrieves all playlists (public and user's own)
func (h *PlaylistHandler) GetPlaylists(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := getUserIDFromContext(ctx)

	// Get user's own playlists
	userPlaylists, err := h.playlistRepo.GetByUserID(ctx, userID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Get public playlists
	publicPlaylists, err := h.playlistRepo.GetPublicPlaylists(ctx)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Combine and deduplicate playlists
	allPlaylists := make([]*models.Playlist, 0, len(userPlaylists)+len(publicPlaylists))
	playlistMap := make(map[string]*models.Playlist)

	// Add user's playlists first
	for _, playlist := range userPlaylists {
		playlistMap[playlist.ID] = playlist
		allPlaylists = append(allPlaylists, playlist)
	}

	// Add public playlists (excluding duplicates)
	for _, playlist := range publicPlaylists {
		if _, exists := playlistMap[playlist.ID]; !exists {
			allPlaylists = append(allPlaylists, playlist)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(allPlaylists)
}

// GetPlaylist retrieves a specific playlist by ID
func (h *PlaylistHandler) GetPlaylist(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	playlistID := vars["id"]

	playlist, err := h.playlistRepo.GetByID(ctx, playlistID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrNotFound)
		return
	}

	// Check if user can access this playlist
	userID := getUserIDFromContext(ctx)
	if playlist.UserID != userID && !playlist.IsPublic {
		errors.WriteErrorResponse(w, errors.ErrForbidden)
		return
	}

	// Populate videos if requested
	populateVideos := r.URL.Query().Get("populate") == "true"
	if populateVideos {
		playlistWithVideos, err := h.populatePlaylistVideos(ctx, playlist)
		if err != nil {
			errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(playlistWithVideos)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(playlist)
}

// CreatePlaylist creates a new playlist
func (h *PlaylistHandler) CreatePlaylist(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := getUserIDFromContext(ctx)

	var playlistReq models.PlaylistRequest
	if err := json.NewDecoder(r.Body).Decode(&playlistReq); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Validate request
	if err := validatePlaylistRequest(&playlistReq); err != nil {
		errors.WriteErrorResponse(w, errors.ErrValidation)
		return
	}

	// Verify all video IDs exist
	for _, videoID := range playlistReq.VideoIDs {
		_, err := h.videoRepo.GetByID(ctx, videoID)
		if err != nil {
			errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
			return
		}
	}

	// Create playlist
	playlist := playlistReq.ToPlaylist(userID)
	if err := h.playlistRepo.Create(ctx, playlist); err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(playlist)
}

// UpdatePlaylist updates an existing playlist
func (h *PlaylistHandler) UpdatePlaylist(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	playlistID := vars["id"]
	userID := getUserIDFromContext(ctx)

	// Get existing playlist
	playlist, err := h.playlistRepo.GetByID(ctx, playlistID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrNotFound)
		return
	}

	// Check ownership
	if playlist.UserID != userID {
		errors.WriteErrorResponse(w, errors.ErrForbidden)
		return
	}

	var playlistReq models.PlaylistRequest
	if err := json.NewDecoder(r.Body).Decode(&playlistReq); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Validate request
	if err := validatePlaylistRequest(&playlistReq); err != nil {
		errors.WriteErrorResponse(w, errors.ErrValidation)
		return
	}

	// Verify all video IDs exist
	for _, videoID := range playlistReq.VideoIDs {
		_, err := h.videoRepo.GetByID(ctx, videoID)
		if err != nil {
			errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
			return
		}
	}

	// Update playlist
	playlist.Name = playlistReq.Name
	playlist.Description = playlistReq.Description
	playlist.VideoIDs = playlistReq.VideoIDs
	playlist.IsPublic = playlistReq.IsPublic
	playlist.UpdatedAt = time.Now()

	if err := h.playlistRepo.Update(ctx, playlistID, playlist); err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(playlist)
}

// DeletePlaylist deletes a playlist
func (h *PlaylistHandler) DeletePlaylist(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	playlistID := vars["id"]
	userID := getUserIDFromContext(ctx)

	// Get existing playlist
	playlist, err := h.playlistRepo.GetByID(ctx, playlistID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrNotFound)
		return
	}

	// Check ownership
	if playlist.UserID != userID {
		errors.WriteErrorResponse(w, errors.ErrForbidden)
		return
	}

	if err := h.playlistRepo.Delete(ctx, playlistID); err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// AddVideoToPlaylist adds a video to a playlist
func (h *PlaylistHandler) AddVideoToPlaylist(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	playlistID := vars["id"]
	userID := getUserIDFromContext(ctx)

	// Get existing playlist
	playlist, err := h.playlistRepo.GetByID(ctx, playlistID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrNotFound)
		return
	}

	// Check ownership
	if playlist.UserID != userID {
		errors.WriteErrorResponse(w, errors.ErrForbidden)
		return
	}

	var req struct {
		VideoID string `json:"video_id" validate:"required"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Verify video exists
	_, err = h.videoRepo.GetByID(ctx, req.VideoID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrNotFound)
		return
	}

	// Add video to playlist
	if err := h.playlistRepo.AddVideo(ctx, playlistID, req.VideoID); err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// RemoveVideoFromPlaylist removes a video from a playlist
func (h *PlaylistHandler) RemoveVideoFromPlaylist(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	playlistID := vars["id"]
	userID := getUserIDFromContext(ctx)

	// Get existing playlist
	playlist, err := h.playlistRepo.GetByID(ctx, playlistID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrNotFound)
		return
	}

	// Check ownership
	if playlist.UserID != userID {
		errors.WriteErrorResponse(w, errors.ErrForbidden)
		return
	}

	var req struct {
		VideoID string `json:"video_id" validate:"required"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Remove video from playlist
	if err := h.playlistRepo.RemoveVideo(ctx, playlistID, req.VideoID); err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ReorderPlaylistVideos reorders videos in a playlist
func (h *PlaylistHandler) ReorderPlaylistVideos(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	playlistID := vars["id"]
	userID := getUserIDFromContext(ctx)

	// Get existing playlist
	playlist, err := h.playlistRepo.GetByID(ctx, playlistID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrNotFound)
		return
	}

	// Check ownership
	if playlist.UserID != userID {
		errors.WriteErrorResponse(w, errors.ErrForbidden)
		return
	}

	var req struct {
		VideoIDs []string `json:"video_ids" validate:"required"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Verify all video IDs exist and are in the playlist
	playlistVideoMap := make(map[string]bool)
	for _, videoID := range playlist.VideoIDs {
		playlistVideoMap[videoID] = true
	}

	for _, videoID := range req.VideoIDs {
		if !playlistVideoMap[videoID] {
			errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
			return
		}
	}

	// Reorder videos
	if err := h.playlistRepo.ReorderVideos(ctx, playlistID, req.VideoIDs); err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetUserPlaylists retrieves playlists for the authenticated user
func (h *PlaylistHandler) GetUserPlaylists(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := getUserIDFromContext(ctx)

	playlists, err := h.playlistRepo.GetByUserID(ctx, userID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(playlists)
}

// GetPublicPlaylists retrieves all public playlists
func (h *PlaylistHandler) GetPublicPlaylists(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	playlists, err := h.playlistRepo.GetPublicPlaylists(ctx)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(playlists)
}

// populatePlaylistVideos populates a playlist with video data
func (h *PlaylistHandler) populatePlaylistVideos(ctx context.Context, playlist *models.Playlist) (*models.PlaylistWithVideos, error) {
	videos := make([]models.Video, 0, len(playlist.VideoIDs))

	for _, videoID := range playlist.VideoIDs {
		video, err := h.videoRepo.GetByID(ctx, videoID)
		if err != nil {
			// Skip videos that no longer exist
			continue
		}
		videos = append(videos, *video)
	}

	return &models.PlaylistWithVideos{
		ID:          playlist.ID,
		Name:        playlist.Name,
		Description: playlist.Description,
		UserID:      playlist.UserID,
		Videos:      videos,
		IsPublic:    playlist.IsPublic,
		CreatedAt:   playlist.CreatedAt,
		UpdatedAt:   playlist.UpdatedAt,
	}, nil
}

// validatePlaylistRequest validates a playlist request
func validatePlaylistRequest(req *models.PlaylistRequest) error {
	if req.Name == "" {
		return &models.ValidationError{Field: "name", Message: "Name is required"}
	}
	if len(req.Name) > 100 {
		return &models.ValidationError{Field: "name", Message: "Name must be 100 characters or less"}
	}
	if len(req.Description) > 500 {
		return &models.ValidationError{Field: "description", Message: "Description must be 500 characters or less"}
	}
	return nil
}
