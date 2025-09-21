package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"video-player-backend/internal/database"
	"video-player-backend/internal/errors"
	"video-player-backend/internal/models"
	"video-player-backend/internal/utils"
)

// VocabularySearchHandler handles vocabulary search operations
type VocabularySearchHandler struct {
	vocabRepo        database.VocabularyRepository
	vocabIndexRepo   database.VocabularyIndexRepository
	videoRepo        database.VideoRepository
	watchHistoryRepo database.WatchHistoryRepository
}

// NewVocabularySearchHandler creates a new vocabulary search handler
func NewVocabularySearchHandler(
	vocabRepo database.VocabularyRepository,
	vocabIndexRepo database.VocabularyIndexRepository,
	videoRepo database.VideoRepository,
	watchHistoryRepo database.WatchHistoryRepository,
) *VocabularySearchHandler {
	return &VocabularySearchHandler{
		vocabRepo:        vocabRepo,
		vocabIndexRepo:   vocabIndexRepo,
		videoRepo:        videoRepo,
		watchHistoryRepo: watchHistoryRepo,
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

	// Create a cache for video objects to avoid fetching the same video multiple times
	videoCache := make(map[string]*models.Video)

	for _, index := range indexes {
		// Always populate video object for each occurrence using cache
		if index.VideoID != "" {
			var video *models.Video
			var exists bool

			// Check cache first
			if video, exists = videoCache[index.VideoID]; !exists {
				// Fetch from database if not in cache
				fetchedVideo, err := h.videoRepo.GetByID(ctx, index.VideoID)
				if err != nil {
					continue
				}
				video = fetchedVideo
				videoCache[index.VideoID] = video
			}

			index.Video = *video
		}

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

	// Resolve filenames to actual videos by matching subtitle path/URL containing the filename
	videoMap := make(map[string]*models.Video)
	filenameToVideoID := make(map[string]string)
	for filename := range uniqueFilenames {
		video, err := h.videoRepo.GetByID(ctx, filename)
		if err != nil {
			continue
		}
		if video != nil && video.ID != "" {
			videoMap[video.ID] = video
			filenameToVideoID[filename] = video.ID
		}
	}

	// Convert map to slice and fill first video id per vocabulary group
	var results []*models.VocabularySearchResult
	for _, result := range vocabMap {
		results = append(results, result)
	}

	// Extract user ID from JWT token in Authorization header
	userID, err := h.getUserIDFromJWT(r)
	var totalExposures, recentExposures int

	if err != nil {
		fmt.Printf("Vocabulary search request - could not extract user ID: %v\n", err)
		userID = "" // Ensure userID is empty if extraction fails
	} else {
		fmt.Printf("Vocabulary search request from user ID: %s\n", userID)

		// Get and print all watch histories for the user
		watchHistories, err := h.watchHistoryRepo.GetByUserID(ctx, userID)
		if err != nil {
			fmt.Printf("Error fetching watch histories for user %s: %v\n", userID, err)
		} else {
			fmt.Printf("Found %d watch histories for user %s:\n", len(watchHistories), userID)
			for i, wh := range watchHistories {
				fmt.Printf("  [%d] Video ID: %s, Progress: %.2f%%, Last Watched: %s\n",
					i+1, wh.VideoID, wh.Progress*100, wh.LastWatched.Format("2006-01-02 15:04:05"))
			}

			// Calculate vocabulary exposure counts based on watch history progress
			totalExposures, recentExposures = h.calculateVocabularyExposure(ctx, userID, watchHistories, results)
		}
	}

	response := map[string]interface{}{
		"message": "Vocabulary search completed",
		"query":   query,
		"results": results,
		"total":   len(results),
	}

	// Add exposure information if user is authenticated
	if userID != "" {
		response["total_exposures"] = totalExposures
		response["recent_exposures"] = recentExposures
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// SearchByEnglish handles GET /api/v1/vocabulary/search/english
func (h *VocabularySearchHandler) SearchByEnglish(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := utils.ContextWithTimeout()
	defer cancel()

	// Extract user ID from JWT token in Authorization header
	userID, err := h.getUserIDFromJWT(r)
	if err != nil {
		fmt.Printf("English vocabulary search request - could not extract user ID: %v\n", err)
	} else {
		fmt.Printf("English vocabulary search request from user ID: %s\n", userID)
	}

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

	// Extract user ID from JWT token in Authorization header
	userID, err := h.getUserIDFromJWT(r)
	if err != nil {
		fmt.Printf("Get video vocabulary request - could not extract user ID: %v\n", err)
	} else {
		fmt.Printf("Get video vocabulary request from user ID: %s\n", userID)
	}

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

	// Extract user ID from JWT token in Authorization header
	userID, err := h.getUserIDFromJWT(r)
	if err != nil {
		fmt.Printf("Get vocabulary stats request - could not extract user ID: %v\n", err)
	} else {
		fmt.Printf("Get vocabulary stats request from user ID: %s\n", userID)
	}

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

	// Extract user ID from JWT token in Authorization header
	userID, err := h.getUserIDFromJWT(r)
	if err != nil {
		fmt.Printf("Reindex all videos request - could not extract user ID: %v\n", err)
	} else {
		fmt.Printf("Reindex all videos request from user ID: %s\n", userID)
	}

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
	err = h.vocabIndexRepo.DeleteAll(ctx)
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

// getUserIDFromJWT extracts user ID from JWT token in Authorization header
func (h *VocabularySearchHandler) getUserIDFromJWT(r *http.Request) (string, error) {
	// Get Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("no authorization header")
	}

	// Extract token from header
	token, err := utils.ExtractTokenFromHeader(authHeader)
	if err != nil {
		return "", err
	}

	// Parse JWT token to get claims
	claims, err := utils.ParseJWTToken(token)
	if err != nil {
		return "", err
	}

	// Extract user ID from claims
	userID, ok := claims["user_id"].(string)
	if !ok || userID == "" {
		return "", fmt.Errorf("no user_id in token")
	}

	return userID, nil
}

// calculateVocabularyExposure calculates how many times a user has been exposed to vocabulary words
// based on their watch history progress and where vocabulary occurs in videos
// Returns total exposures and exposures in the last 7 days
func (h *VocabularySearchHandler) calculateVocabularyExposure(ctx context.Context, userID string, watchHistories []*models.WatchHistory, results []*models.VocabularySearchResult) (int, int) {
	fmt.Printf("Calculating vocabulary exposure for user %s...\n", userID)

	// Create a map to track watch history by video ID for quick lookup
	watchMap := make(map[string]*models.WatchHistory)
	for _, wh := range watchHistories {
		watchMap[wh.VideoID] = wh
	}

	// Calculate cutoff date for last 7 days
	sevenDaysAgo := time.Now().AddDate(0, 0, -7)

	totalExposures := 0
	recentExposures := 0

	// Process each vocabulary result
	for _, result := range results {
		exposureCount := 0
		recentExposureCount := 0

		// Check each occurrence of this vocabulary word
		for _, occurrence := range result.Occurrences {
			// Check if user has watched this video
			if watchHistory, hasWatched := watchMap[occurrence.VideoID]; hasWatched {
				// Calculate the maximum time the user has reached in this video (in seconds)
				maxWatchedTime := watchHistory.Progress * watchHistory.Duration

				// Check if the vocabulary occurrence happens before or at the time the user has watched
				if occurrence.StartTime <= maxWatchedTime {
					exposureCount++

					// Check if this exposure happened in the last 7 days
					if watchHistory.LastWatched.After(sevenDaysAgo) {
						recentExposureCount++
					}
				}
			}
		}

		// Update the result with exposure count
		result.ExposureCount = exposureCount

		totalExposures += exposureCount
		recentExposures += recentExposureCount
	}

	fmt.Printf("Total exposures: %d, Recent exposures (last 7 days): %d\n", totalExposures, recentExposures)
	return totalExposures, recentExposures
}
