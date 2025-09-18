package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

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

// BatchVocabularyUpload handles POST /vocabulary/batch-upload
func (h *VocabularyHandler) BatchVocabularyUpload(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	// Parse multipart form with 32MB max memory
	err := r.ParseMultipartForm(32 << 20) // 32MB
	if err != nil {
		errors.WriteErrorResponse(w, errors.NewAPIErrorWithDetails(
			errors.ErrInvalidRequest.Code,
			"Failed to parse multipart form",
			err.Error(),
		))
		return
	}

	// Get the CSV file from the form
	file, header, err := r.FormFile("csv")
	if err != nil {
		errors.WriteErrorResponse(w, errors.NewAPIErrorWithDetails(
			errors.ErrInvalidRequest.Code,
			"CSV file is required",
			"Please upload a CSV file with the 'csv' field name",
		))
		return
	}
	defer file.Close()

	// Validate file type
	if header.Header.Get("Content-Type") != "text/csv" &&
		!strings.HasSuffix(strings.ToLower(header.Filename), ".csv") {
		errors.WriteErrorResponse(w, errors.NewAPIError(
			errors.ErrInvalidRequest.Code,
			"File must be a CSV file",
		))
		return
	}

	// Validate file size (max 10MB)
	if header.Size > 100*1024*1024 {
		errors.WriteErrorResponse(w, errors.NewAPIError(
			errors.ErrInvalidRequest.Code,
			"CSV file size exceeds 100MB limit",
		))
		return
	}

	// Parse CSV and validate format
	vocabularies, err := utils.ParseVocabularyCSV(file)
	if err != nil {
		errors.WriteErrorResponse(w, errors.NewAPIErrorWithDetails(
			errors.ErrInvalidRequest.Code,
			"CSV parsing failed",
			err.Error(),
		))
		return
	}

	// Check if we have any vocabulary items to insert
	if len(vocabularies) == 0 {
		errors.WriteErrorResponse(w, errors.NewAPIError(
			errors.ErrInvalidRequest.Code,
			"No valid vocabulary items found in CSV",
		))
		return
	}

	// Check duplicate handling mode from query parameter
	duplicateMode := r.URL.Query().Get("duplicates")

	var response map[string]interface{}

	switch duplicateMode {
	case "skip":
		// Skip duplicates - only create new items
		var newVocabularies []*models.Vocabulary
		var skippedCount int

		for _, vocab := range vocabularies {
			existing, err := h.repo.CheckExisting(ctx, vocab.Maori)
			if err != nil {
				errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
				return
			}

			if existing != nil {
				skippedCount++
			} else {
				newVocabularies = append(newVocabularies, vocab)
			}
		}

		if len(newVocabularies) > 0 {
			err = h.repo.CreateBatch(ctx, newVocabularies)
			if err != nil {
				errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
				return
			}
		}

		response = map[string]interface{}{
			"message": fmt.Sprintf("Processed %d vocabulary items: %d created, %d skipped (duplicates)",
				len(vocabularies), len(newVocabularies), skippedCount),
			"created": len(newVocabularies),
			"skipped": skippedCount,
			"total":   len(vocabularies),
			"items":   newVocabularies,
		}

	case "update":
		// Update duplicates - upsert behavior
		created, updated, err := h.repo.UpsertBatch(ctx, vocabularies)
		if err != nil {
			errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
			return
		}

		response = map[string]interface{}{
			"message": fmt.Sprintf("Processed %d vocabulary items: %d created, %d updated",
				len(vocabularies), len(created), len(updated)),
			"created":       len(created),
			"updated":       len(updated),
			"total":         len(vocabularies),
			"created_items": created,
			"updated_items": updated,
		}

	case "error":
		// Error on duplicates - check for existing items first
		var existingItems []string
		for _, vocab := range vocabularies {
			existing, err := h.repo.CheckExisting(ctx, vocab.Maori)
			if err != nil {
				errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
				return
			}

			if existing != nil {
				existingItems = append(existingItems, vocab.Maori)
			}
		}

		if len(existingItems) > 0 {
			errors.WriteErrorResponse(w, errors.NewAPIErrorWithDetails(
				errors.ErrInvalidRequest.Code,
				"Duplicate vocabulary items found",
				fmt.Sprintf("The following Māori words already exist: %s", strings.Join(existingItems, ", ")),
			))
			return
		}

		// No duplicates found, proceed with normal batch creation
		err = h.repo.CreateBatch(ctx, vocabularies)
		if err != nil {
			errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
			return
		}

		response = map[string]interface{}{
			"message": fmt.Sprintf("Successfully uploaded %d vocabulary items", len(vocabularies)),
			"created": len(vocabularies),
			"total":   len(vocabularies),
			"items":   vocabularies,
		}

	default:
		// Default behavior: update duplicates (same as "update" mode)
		created, updated, err := h.repo.UpsertBatch(ctx, vocabularies)
		if err != nil {
			errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
			return
		}

		response = map[string]interface{}{
			"message": fmt.Sprintf("Processed %d vocabulary items: %d created, %d updated",
				len(vocabularies), len(created), len(updated)),
			"created":       len(created),
			"updated":       len(updated),
			"total":         len(vocabularies),
			"created_items": created,
			"updated_items": updated,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}
