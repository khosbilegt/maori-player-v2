package validation

import (
	"strings"

	"video-player-backend/internal/errors"
	"video-player-backend/internal/models"
)

// ValidateVideoRequest validates a video request
func ValidateVideoRequest(req *models.VideoRequest) *errors.ValidationErrors {
	ve := &errors.ValidationErrors{}

	// Validate title
	if strings.TrimSpace(req.Title) == "" {
		ve.Add("title", "Title is required")
	} else if len(req.Title) > 200 {
		ve.Add("title", "Title must be less than 200 characters")
	}

	// Validate video URL
	if strings.TrimSpace(req.Video) == "" {
		ve.Add("video", "Video URL is required")
	} else if !isValidURL(req.Video) {
		ve.Add("video", "Video URL must be a valid URL")
	}

	// Validate thumbnail URL (optional but if provided, must be valid)
	if req.Thumbnail != "" && !isValidURL(req.Thumbnail) {
		ve.Add("thumbnail", "Thumbnail URL must be a valid URL")
	}

	// Validate description length
	if len(req.Description) > 1000 {
		ve.Add("description", "Description must be less than 1000 characters")
	}

	// Validate duration format (optional but if provided, should be in MM:SS or HH:MM:SS format)
	if req.Duration != "" && !isValidDuration(req.Duration) {
		ve.Add("duration", "Duration must be in MM:SS or HH:MM:SS format")
	}

	// Validate subtitle path (optional but if provided, should start with /)
	if strings.TrimSpace(req.Subtitle) == "" {
		ve.Add("subtitle", "Subtitle URL is required")
	} else if !isValidURL(req.Subtitle) {
		ve.Add("subtitle", "Subtitle URL must be a valid URL")
	}

	return ve
}

// ValidateVideoID validates a video ID
func ValidateVideoID(id string) *errors.ValidationErrors {
	ve := &errors.ValidationErrors{}

	if strings.TrimSpace(id) == "" {
		ve.Add("id", "Video ID is required")
	} else if len(id) < 3 {
		ve.Add("id", "Video ID must be at least 3 characters")
	}

	return ve
}

// isValidURL performs basic URL validation
func isValidURL(url string) bool {
	return strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://")
}

// isValidDuration validates duration format (MM:SS or HH:MM:SS)
func isValidDuration(duration string) bool {
	parts := strings.Split(duration, ":")
	if len(parts) != 2 && len(parts) != 3 {
		return false
	}

	// Basic check - all parts should be numeric
	for _, part := range parts {
		if len(part) == 0 || len(part) > 2 {
			return false
		}
		for _, char := range part {
			if char < '0' || char > '9' {
				return false
			}
		}
	}

	return true
}
