package handlers

import (
	"encoding/json"
	"net/http"

	"video-player-backend/internal/database"
	"video-player-backend/internal/errors"
	"video-player-backend/internal/models"
	"video-player-backend/internal/utils"
)

// VocabularySearchHandler handles vocabulary search operations
type VocabularySearchHandler struct {
	vocabRepo      database.VocabularyRepository
	vocabIndexRepo database.VocabularyIndexRepository
	videoRepo      database.VideoRepository
}

// NewVocabularySearchHandler creates a new vocabulary search handler
func NewVocabularySearchHandler(
	vocabRepo database.VocabularyRepository,
	vocabIndexRepo database.VocabularyIndexRepository,
	videoRepo database.VideoRepository,
) *VocabularySearchHandler {
	return &VocabularySearchHandler{
		vocabRepo:      vocabRepo,
		vocabIndexRepo: vocabIndexRepo,
		videoRepo:      videoRepo,
	}
}

// SearchVocabulary handles GET /api/v1/vocabulary/search
func (h *VocabularySearchHandler) SearchVocabulary(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	query := r.URL.Query().Get("q")
	if query == "" {
		errors.WriteErrorResponse(w, errors.NewAPIError(
			errors.ErrInvalidRequest.Code,
			"Query parameter 'q' is required",
		))
		return
	}

	// Search in vocabulary index
	indexes, err := h.vocabIndexRepo.SearchByVocabulary(ctx, query)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Group results by vocabulary word
	vocabMap := make(map[string]*models.VocabularySearchResult)
	uniqueFilenames := make(map[string]struct{})

	for _, index := range indexes {
		if result, exists := vocabMap[index.Vocabulary]; exists {
			result.Occurrences = append(result.Occurrences, *index)
			result.TotalCount++
		} else {
			if index.VttFileID != "" {
				videos, err := h.videoRepo.FindBySubtitleFilename(ctx, index.VttFileID)
				if err != nil {
					continue
				}
				index.Video = *videos[0]
			}
			vocabMap[index.Vocabulary] = &models.VocabularySearchResult{
				Vocabulary:  index.Vocabulary,
				English:     index.English,
				Description: index.Description,
				Occurrences: []models.VocabularyIndex{*index},
				TotalCount:  1,
			}
		}

	}

	// Resolve filenames to actual videos by matching subtitle path/URL containing the filename
	videoMap := make(map[string]*models.Video)
	filenameToVideoID := make(map[string]string)
	for filename := range uniqueFilenames {
		videos, err := h.videoRepo.FindBySubtitleFilename(ctx, filename)
		if err != nil {
			continue
		}
		for _, v := range videos {
			if v != nil && v.ID != "" {
				videoMap[v.ID] = v
				filenameToVideoID[filename] = v.ID
			}
		}
	}

	// Convert map to slice and fill first video id per vocabulary group
	var results []*models.VocabularySearchResult
	for _, result := range vocabMap {
		results = append(results, result)
	}

	response := map[string]interface{}{
		"message": "Vocabulary search completed",
		"query":   query,
		"results": results,
		"total":   len(results),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// SearchByEnglish handles GET /api/v1/vocabulary/search/english
func (h *VocabularySearchHandler) SearchByEnglish(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	query := r.URL.Query().Get("q")
	if query == "" {
		errors.WriteErrorResponse(w, errors.NewAPIError(
			errors.ErrInvalidRequest.Code,
			"Query parameter 'q' is required",
		))
		return
	}

	// Search in vocabulary index by English translation
	indexes, err := h.vocabIndexRepo.SearchByEnglish(ctx, query)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Group results by vocabulary word
	vocabMap := make(map[string]*models.VocabularySearchResult)

	for _, index := range indexes {
		if result, exists := vocabMap[index.Vocabulary]; exists {
			result.Occurrences = append(result.Occurrences, *index)
			result.TotalCount++
		} else {
			vocabMap[index.Vocabulary] = &models.VocabularySearchResult{
				Vocabulary:  index.Vocabulary,
				English:     index.English,
				Description: index.Description,
				Occurrences: []models.VocabularyIndex{*index},
				TotalCount:  1,
			}
		}
	}

	// Convert map to slice
	var results []*models.VocabularySearchResult
	for _, result := range vocabMap {
		results = append(results, result)
	}

	response := map[string]interface{}{
		"message": "English vocabulary search completed",
		"query":   query,
		"results": results,
		"total":   len(results),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetVideoVocabulary handles GET /api/v1/vocabulary/video/{videoId}
func (h *VocabularySearchHandler) GetVideoVocabulary(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	videoID := r.URL.Query().Get("video_id")
	if videoID == "" {
		errors.WriteErrorResponse(w, errors.NewAPIError(
			errors.ErrInvalidRequest.Code,
			"Video ID is required",
		))
		return
	}

	// Get vocabulary indexes for the video
	indexes, err := h.vocabIndexRepo.GetByVideoID(ctx, videoID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Get video information
	video, err := h.videoRepo.GetByID(ctx, videoID)
	if err != nil {
		// Video might not exist, but we can still return vocabulary indexes
		video = nil
	}

	response := map[string]interface{}{
		"message":    "Video vocabulary retrieved",
		"video_id":   videoID,
		"video":      video,
		"vocabulary": indexes,
		"total":      len(indexes),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetVocabularyStats handles GET /api/v1/vocabulary/stats
func (h *VocabularySearchHandler) GetVocabularyStats(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	// Get vocabulary index statistics
	stats, err := h.vocabIndexRepo.GetStats(ctx)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	response := map[string]interface{}{
		"message": "Vocabulary statistics retrieved",
		"stats":   stats,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// ReindexAllVideos handles POST /api/v1/vocabulary/reindex
func (h *VocabularySearchHandler) ReindexAllVideos(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	// Get all videos
	videos, err := h.videoRepo.GetAll(ctx)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Get all vocabulary
	vocabularies, err := h.vocabRepo.GetAll(ctx)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Clear existing indexes
	_, err = h.vocabIndexRepo.GetAll(ctx)
	if err != nil {
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
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

		// Parse VTT content
		transcriptLines, err := utils.ParseVTTToLines(video.Subtitle)
		if err != nil {
			continue // Skip videos with invalid VTT
		}

		// Index vocabulary for this video
		indexes, err := indexer.IndexTranscript(video.ID, transcriptLines)
		if err != nil {
			continue // Skip videos that fail indexing
		}

		// Save indexes to database
		if len(indexes) > 0 {
			err = h.vocabIndexRepo.CreateBatch(ctx, indexes)
			if err != nil {
				continue // Skip videos that fail to save
			}
			totalIndexed += len(indexes)
		}

		processedVideos++
	}

	response := map[string]interface{}{
		"message":          "Reindexing completed",
		"processed_videos": processedVideos,
		"total_indexed":    totalIndexed,
		"total_videos":     len(videos),
		"total_vocabulary": len(vocabularies),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
