package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
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
	repo           database.VocabularyRepository
	vocabIndexRepo database.VocabularyIndexRepository
	videoRepo      database.VideoRepository
}

// NewVocabularyHandler creates a new vocabulary handler
func NewVocabularyHandler(repo database.VocabularyRepository, vocabIndexRepo database.VocabularyIndexRepository, videoRepo database.VideoRepository) *VocabularyHandler {
	return &VocabularyHandler{
		repo:           repo,
		vocabIndexRepo: vocabIndexRepo,
		videoRepo:      videoRepo,
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

	// Delete all existing vocabularies before processing new ones
	err = h.repo.DeleteAll(ctx)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Since we deleted all vocabularies, we can simply create all new ones
	err = h.repo.CreateBatch(ctx, vocabularies)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Reindex all videos with the new vocabulary
	reindexResult, err := h.reindexAllVideos(ctx, vocabularies)
	if err != nil {
		// Log the error but don't fail the entire operation
		fmt.Printf("Warning: Failed to reindex videos after vocabulary upload: %v\n", err)
	}

	response := map[string]interface{}{
		"message": fmt.Sprintf("Successfully uploaded %d vocabulary items", len(vocabularies)),
		"created": len(vocabularies),
		"total":   len(vocabularies),
		"items":   vocabularies,
	}

	// Add reindexing results to response
	if reindexResult != nil {
		response["reindexing"] = reindexResult
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// reindexAllVideos reindexes all videos with the given vocabulary
func (h *VocabularyHandler) reindexAllVideos(ctx context.Context, vocabularies []*models.Vocabulary) (map[string]interface{}, error) {
	// Get all videos
	videos, err := h.videoRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get videos: %w", err)
	}

	// Clear existing indexes
	err = h.vocabIndexRepo.DeleteAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to clear existing indexes: %w", err)
	}

	// Create vocabulary indexer
	indexer := utils.NewVocabularyIndexer(vocabularies)

	totalIndexed := 0
	processedVideos := 0

	// Process each video
	for _, video := range videos {
		if video.Subtitle == "" {
			continue // Skip videos without subtitles
		}

		// Extract filename from subtitle URL/path
		var vttFilename string
		if strings.HasPrefix(video.Subtitle, "/api/v1/uploads/vtt/") {
			// Extract filename from URL
			vttFilename = strings.TrimPrefix(video.Subtitle, "/api/v1/uploads/vtt/")
		} else if strings.Contains(video.Subtitle, "/") {
			// Extract filename from path
			vttFilename = filepath.Base(video.Subtitle)
		} else {
			// Assume it's already a filename
			vttFilename = video.Subtitle
		}

		// Construct full path to VTT file
		vttFilePath := filepath.Join("./uploads/vtt", vttFilename)

		// Check if file exists
		if _, err := os.Stat(vttFilePath); os.IsNotExist(err) {
			fmt.Printf("VTT file not found: %s\n", vttFilePath)
			continue // Skip videos with missing VTT files
		}

		// Read VTT file content
		vttContent, err := os.ReadFile(vttFilePath)
		if err != nil {
			fmt.Printf("Error reading VTT file %s: %v\n", vttFilePath, err)
			continue // Skip videos with unreadable VTT files
		}

		// Parse VTT content
		transcriptLines, err := utils.ParseVTTToLines(string(vttContent))
		if err != nil {
			fmt.Printf("Error parsing VTT content for video %s: %v\n", video.ID, err)
			continue // Skip videos with invalid VTT
		}

		// Index vocabulary for this video
		indexes, err := indexer.IndexTranscript(video.ID, transcriptLines)
		if err != nil {
			fmt.Println("Error indexing vocabulary:", err)
			continue // Skip videos that fail indexing
		}

		// Save indexes to database
		if len(indexes) > 0 {
			err = h.vocabIndexRepo.CreateBatch(ctx, indexes)
			if err != nil {
				fmt.Println("Error saving indexes:", err)
				continue // Skip videos that fail to save
			}
			totalIndexed += len(indexes)
		}

		processedVideos++
	}

	return map[string]interface{}{
		"processed_videos": processedVideos,
		"total_indexed":    totalIndexed,
		"total_videos":     len(videos),
		"total_vocabulary": len(vocabularies),
	}, nil
}
