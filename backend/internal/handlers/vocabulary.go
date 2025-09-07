package handlers

import (
	"encoding/json"
	"net/http"

	"video-player-backend/internal/database"
	"video-player-backend/internal/errors"
	"video-player-backend/internal/models"
	"video-player-backend/internal/utils"
	"video-player-backend/internal/validation"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
)

// VocabularyHandler handles vocabulary-related HTTP requests
type VocabularyHandler struct {
	repo database.VocabularyRepository
}

// NewVocabularyHandler creates a new vocabulary handler
func NewVocabularyHandler(repo database.VocabularyRepository) *VocabularyHandler {
	return &VocabularyHandler{
		repo: repo,
	}
}

// GetVocabularies handles GET /vocabulary
func (h *VocabularyHandler) GetVocabularies(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	vocabularies, err := h.repo.GetAll(ctx)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	if vocabularies == nil {
		vocabularies = []*models.Vocabulary{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(vocabularies)
}

// GetVocabulary handles GET /vocabulary/{id}
func (h *VocabularyHandler) GetVocabulary(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	params := mux.Vars(r)
	id := params["id"]

	// Validate vocabulary ID
	if ve := validation.ValidateVocabularyID(id); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	vocabulary, err := h.repo.GetByID(ctx, id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			errors.WriteErrorResponse(w, errors.ErrVocabularyNotFound)
			return
		}
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(vocabulary)
}

// CreateVocabulary handles POST /vocabulary
func (h *VocabularyHandler) CreateVocabulary(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	var vocabReq models.VocabularyRequest
	if err := json.NewDecoder(r.Body).Decode(&vocabReq); err != nil {
		errors.WriteErrorResponse(w, errors.NewAPIErrorWithDetails(
			errors.ErrInvalidRequest.Code,
			"Invalid JSON format",
			err.Error(),
		))
		return
	}

	// Validate vocabulary request
	if ve := validation.ValidateVocabularyRequest(&vocabReq); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	vocabulary := vocabReq.ToVocabulary()
	vocabulary.GenerateID()

	if err := h.repo.Create(ctx, vocabulary); err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(vocabulary)
}

// UpdateVocabulary handles PUT /vocabulary/{id}
func (h *VocabularyHandler) UpdateVocabulary(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	params := mux.Vars(r)
	id := params["id"]

	// Validate vocabulary ID
	if ve := validation.ValidateVocabularyID(id); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	var vocabReq models.VocabularyRequest
	if err := json.NewDecoder(r.Body).Decode(&vocabReq); err != nil {
		errors.WriteErrorResponse(w, errors.NewAPIErrorWithDetails(
			errors.ErrInvalidRequest.Code,
			"Invalid JSON format",
			err.Error(),
		))
		return
	}

	// Validate vocabulary request
	if ve := validation.ValidateVocabularyRequest(&vocabReq); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	// Check if vocabulary exists
	existingVocabulary, err := h.repo.GetByID(ctx, id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			errors.WriteErrorResponse(w, errors.ErrVocabularyNotFound)
			return
		}
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Update the vocabulary
	existingVocabulary.UpdateFromRequest(&vocabReq)

	if err := h.repo.Update(ctx, id, existingVocabulary); err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existingVocabulary)
}

// DeleteVocabulary handles DELETE /vocabulary/{id}
func (h *VocabularyHandler) DeleteVocabulary(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	params := mux.Vars(r)
	id := params["id"]

	// Validate vocabulary ID
	if ve := validation.ValidateVocabularyID(id); ve.HasErrors() {
		errors.WriteValidationError(w, ve)
		return
	}

	if err := h.repo.Delete(ctx, id); err != nil {
		if err == mongo.ErrNoDocuments {
			errors.WriteErrorResponse(w, errors.ErrVocabularyNotFound)
			return
		}
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// SearchVocabularies handles GET /vocabulary/search?q={query}
func (h *VocabularyHandler) SearchVocabularies(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	query := r.URL.Query().Get("q")
	if query == "" {
		errors.WriteErrorResponse(w, errors.NewAPIError(
			errors.ErrInvalidRequest.Code,
			"Search query parameter 'q' is required",
		))
		return
	}

	vocabularies, err := h.repo.Search(ctx, query)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	if vocabularies == nil {
		vocabularies = []*models.Vocabulary{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(vocabularies)
}
