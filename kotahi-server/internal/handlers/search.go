package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"video-player-backend/internal/database"
	"video-player-backend/internal/errors"
	"video-player-backend/internal/models"
	"video-player-backend/internal/utils"
)

// SearchHandler handles general search requests
type SearchHandler struct {
	videoRepo      database.VideoRepository
	vocabularyRepo database.VocabularyRepository
	vocabIndexRepo database.VocabularyIndexRepository
}

// NewSearchHandler creates a new search handler
func NewSearchHandler(
	videoRepo database.VideoRepository,
	vocabularyRepo database.VocabularyRepository,
	vocabIndexRepo database.VocabularyIndexRepository,
) *SearchHandler {
	return &SearchHandler{
		videoRepo:      videoRepo,
		vocabularyRepo: vocabularyRepo,
		vocabIndexRepo: vocabIndexRepo,
	}
}

// GeneralSearch handles GET /search?q={query}
func (h *SearchHandler) GeneralSearch(w http.ResponseWriter, r *http.Request) {
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

	// Trim whitespace and validate query length
	query = strings.TrimSpace(query)
	if len(query) < 2 {
		errors.WriteErrorResponse(w, errors.NewAPIError(
			errors.ErrInvalidRequest.Code,
			"Search query must be at least 2 characters long",
		))
		return
	}

	// Search across all types concurrently
	videoChan := make(chan []*models.Video, 1)
	vocabVideoChan := make(chan []*models.Video, 1)
	errorChan := make(chan error, 2)

	// Search videos by title/description
	go func() {
		videos, err := h.videoRepo.Search(ctx, query)
		if err != nil {
			errorChan <- err
			return
		}
		videoChan <- videos
	}()

	// Search videos by vocabulary (using vocabulary index)
	go func() {
		vocabVideos, err := h.searchVideosByVocabulary(ctx, query)
		if err != nil {
			errorChan <- err
			return
		}
		vocabVideoChan <- vocabVideos
	}()

	// Collect results
	var videos []*models.Video
	var vocabVideos []*models.Video
	var searchErrors []error

	// Wait for all searches to complete
	for i := 0; i < 2; i++ {
		select {
		case videos = <-videoChan:
		case vocabVideos = <-vocabVideoChan:
		case err := <-errorChan:
			searchErrors = append(searchErrors, err)
		}
	}

	// If there are any errors, return the first one
	if len(searchErrors) > 0 {
		errors.WriteErrorResponse(w, errors.WrapError(searchErrors[0], errors.ErrDatabase))
		return
	}

	// Build unified search results
	var results []models.SearchResult

	// Combine and deduplicate video results
	videoMap := make(map[string]*models.Video)

	// Add videos from title/description search
	for _, video := range videos {
		videoMap[video.ID] = video
	}

	// Add videos from vocabulary search (avoiding duplicates)
	for _, video := range vocabVideos {
		if _, exists := videoMap[video.ID]; !exists {
			videoMap[video.ID] = video
		}
	}

	// Add video results
	for _, video := range videoMap {
		results = append(results, models.SearchResult{
			Type:        "video",
			ID:          video.ID,
			Title:       video.Title,
			Description: video.Description,
			Data:        video,
		})
	}

	// Create response
	response := models.SearchResponse{
		Query:   query,
		Results: results,
		Counts: models.SearchCounts{
			Videos: len(videoMap),
			Total:  len(results),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// searchVideosByVocabulary searches for videos that contain the given vocabulary
func (h *SearchHandler) searchVideosByVocabulary(ctx context.Context, query string) ([]*models.Video, error) {
	// Search in vocabulary index
	indexes, err := h.vocabIndexRepo.SearchByVocabulary(ctx, query)
	if err != nil {
		return nil, err
	}

	// Also search by English translation
	englishIndexes, err := h.vocabIndexRepo.SearchByEnglish(ctx, query)
	if err != nil {
		return nil, err
	}

	// Combine both results
	allIndexes := append(indexes, englishIndexes...)

	// Get unique video IDs
	videoIDMap := make(map[string]struct{})
	for _, index := range allIndexes {
		if index.VttFileID != "" {
			// Find videos by subtitle filename
			videos, err := h.videoRepo.FindBySubtitleFilename(ctx, index.VttFileID)
			if err != nil {
				continue
			}
			for _, video := range videos {
				if video != nil && video.ID != "" {
					videoIDMap[video.ID] = struct{}{}
				}
			}
		}
	}

	// Convert map keys to slice of video IDs
	var videoIDs []string
	for videoID := range videoIDMap {
		videoIDs = append(videoIDs, videoID)
	}

	// Get the actual video objects
	var videos []*models.Video
	for _, videoID := range videoIDs {
		video, err := h.videoRepo.GetByID(ctx, videoID)
		if err != nil {
			continue
		}
		videos = append(videos, video)
	}

	return videos, nil
}
