package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"video-player-backend/internal/database"
	"video-player-backend/internal/errors"
	"video-player-backend/internal/models"
	"video-player-backend/internal/validation"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
)

// VideoHandler handles video-related HTTP requests
type VideoHandler struct {
	repo database.VideoRepository
}

// NewVideoHandler creates a new video handler
func NewVideoHandler(repo database.VideoRepository) *VideoHandler {
	return &VideoHandler{
		repo: repo,
	}
}

// GetVideos handles GET /videos
func (h *VideoHandler) GetVideos(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout()
	defer cancel()

	videos, err := h.repo.GetAll(ctx)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	if videos == nil {
		videos = []*models.Video{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(videos)
}

// GetVideo handles GET /videos/{id}
func (h *VideoHandler) GetVideo(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout()
	defer cancel()

	params := mux.Vars(r)
	id := params["id"]

	// Validate video ID
	if ve := validation.ValidateVideoID(id); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	video, err := h.repo.GetByID(ctx, id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			errors.WriteErrorResponse(w, errors.ErrVideoNotFound)
			return
		}
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(video)
}

// CreateVideo handles POST /videos
func (h *VideoHandler) CreateVideo(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout()
	defer cancel()

	var videoReq models.VideoRequest
	if err := json.NewDecoder(r.Body).Decode(&videoReq); err != nil {
		errors.WriteErrorResponse(w, errors.NewAPIErrorWithDetails(
			errors.ErrInvalidRequest.Code,
			"Invalid JSON format",
			err.Error(),
		))
		return
	}

	// Validate video request
	if ve := validation.ValidateVideoRequest(&videoReq); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	video := videoReq.ToVideo()
	video.GenerateID()

	if err := h.repo.Create(ctx, video); err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(video)
}

// UpdateVideo handles PUT /videos/{id}
func (h *VideoHandler) UpdateVideo(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout()
	defer cancel()

	params := mux.Vars(r)
	id := params["id"]

	// Validate video ID
	if ve := validation.ValidateVideoID(id); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	var videoReq models.VideoRequest
	if err := json.NewDecoder(r.Body).Decode(&videoReq); err != nil {
		errors.WriteErrorResponse(w, errors.NewAPIErrorWithDetails(
			errors.ErrInvalidRequest.Code,
			"Invalid JSON format",
			err.Error(),
		))
		return
	}

	// Validate video request
	if ve := validation.ValidateVideoRequest(&videoReq); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	video := videoReq.ToVideo()
	video.ID = id

	if err := h.repo.Update(ctx, id, video); err != nil {
		if err == mongo.ErrNoDocuments {
			errors.WriteErrorResponse(w, errors.ErrVideoNotFound)
			return
		}
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(video)
}

// DeleteVideo handles DELETE /videos/{id}
func (h *VideoHandler) DeleteVideo(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout()
	defer cancel()

	params := mux.Vars(r)
	id := params["id"]

	// Validate video ID
	if ve := validation.ValidateVideoID(id); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	if err := h.repo.Delete(ctx, id); err != nil {
		if err == mongo.ErrNoDocuments {
			errors.WriteErrorResponse(w, errors.ErrVideoNotFound)
			return
		}
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// contextWithTimeout creates a context with timeout
func contextWithTimeout() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 10*time.Second)
}
