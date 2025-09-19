package handlers

import (
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
	playlistRepo   database.PlaylistRepository
}

// NewSearchHandler creates a new search handler
func NewSearchHandler(
	videoRepo database.VideoRepository,
	vocabularyRepo database.VocabularyRepository,
	playlistRepo database.PlaylistRepository,
) *SearchHandler {
	return &SearchHandler{
		videoRepo:      videoRepo,
		vocabularyRepo: vocabularyRepo,
		playlistRepo:   playlistRepo,
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

	// Search across all three types concurrently
	videoChan := make(chan []*models.Video, 1)
	vocabularyChan := make(chan []*models.Vocabulary, 1)
	playlistChan := make(chan []*models.Playlist, 1)
	errorChan := make(chan error, 3)

	// Search videos
	go func() {
		videos, err := h.videoRepo.Search(ctx, query)
		if err != nil {
			errorChan <- err
			return
		}
		videoChan <- videos
	}()

	// Search vocabulary
	go func() {
		vocabularies, err := h.vocabularyRepo.Search(ctx, query)
		if err != nil {
			errorChan <- err
			return
		}
		vocabularyChan <- vocabularies
	}()

	// Search playlists
	go func() {
		playlists, err := h.playlistRepo.Search(ctx, query)
		if err != nil {
			errorChan <- err
			return
		}
		playlistChan <- playlists
	}()

	// Collect results
	var videos []*models.Video
	var vocabularies []*models.Vocabulary
	var playlists []*models.Playlist
	var searchErrors []error

	// Wait for all searches to complete
	for i := 0; i < 3; i++ {
		select {
		case videos = <-videoChan:
		case vocabularies = <-vocabularyChan:
		case playlists = <-playlistChan:
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

	// Add video results
	for _, video := range videos {
		results = append(results, models.SearchResult{
			Type:        "video",
			ID:          video.ID,
			Title:       video.Title,
			Description: video.Description,
			Data:        video,
		})
	}

	// Add vocabulary results
	for _, vocabulary := range vocabularies {
		results = append(results, models.SearchResult{
			Type:        "vocabulary",
			ID:          vocabulary.ID,
			Title:       vocabulary.Maori,
			Description: vocabulary.English,
			Data:        vocabulary,
		})
	}

	// Add playlist results
	for _, playlist := range playlists {
		results = append(results, models.SearchResult{
			Type:        "playlist",
			ID:          playlist.ID,
			Title:       playlist.Name,
			Description: playlist.Description,
			Data:        playlist,
		})
	}

	// Create response
	response := models.SearchResponse{
		Query:   query,
		Results: results,
		Counts: models.SearchCounts{
			Videos:       len(videos),
			Vocabularies: len(vocabularies),
			Playlists:    len(playlists),
			Total:        len(results),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
