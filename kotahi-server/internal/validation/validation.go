package validation

import (
	"regexp"
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

// ValidateUserRequest validates a user registration request
func ValidateUserRequest(req *models.UserRequest) *errors.ValidationErrors {
	ve := &errors.ValidationErrors{}

	// Validate email
	if strings.TrimSpace(req.Email) == "" {
		ve.Add("email", "Email is required")
	} else if !isValidEmail(req.Email) {
		ve.Add("email", "Email must be a valid email address")
	}

	// Validate username
	if strings.TrimSpace(req.Username) == "" {
		ve.Add("username", "Username is required")
	} else if len(req.Username) < 3 {
		ve.Add("username", "Username must be at least 3 characters")
	} else if len(req.Username) > 20 {
		ve.Add("username", "Username must be less than 20 characters")
	} else if !isValidUsername(req.Username) {
		ve.Add("username", "Username can only contain letters, numbers, and underscores")
	}

	// Validate password
	if strings.TrimSpace(req.Password) == "" {
		ve.Add("password", "Password is required")
	} else if len(req.Password) < 6 {
		ve.Add("password", "Password must be at least 6 characters")
	} else if len(req.Password) > 100 {
		ve.Add("password", "Password must be less than 100 characters")
	}

	return ve
}

// ValidateLoginRequest validates a login request
func ValidateLoginRequest(req *models.LoginRequest) *errors.ValidationErrors {
	ve := &errors.ValidationErrors{}

	// Validate email
	if strings.TrimSpace(req.Email) == "" {
		ve.Add("email", "Email is required")
	} else if !isValidEmail(req.Email) {
		ve.Add("email", "Email must be a valid email address")
	}

	// Validate password
	if strings.TrimSpace(req.Password) == "" {
		ve.Add("password", "Password is required")
	}

	return ve
}

// isValidEmail performs basic email validation
func isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// isValidUsername validates username format (alphanumeric and underscores only)
func isValidUsername(username string) bool {
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	return usernameRegex.MatchString(username)
}

// ValidateVocabularyRequest validates a vocabulary request
func ValidateVocabularyRequest(req *models.VocabularyRequest) *errors.ValidationErrors {
	ve := &errors.ValidationErrors{}

	// Validate Māori text
	if strings.TrimSpace(req.Maori) == "" {
		ve.Add("maori", "Māori text is required")
	} else if len(req.Maori) > 200 {
		ve.Add("maori", "Māori text must be less than 200 characters")
	}

	// Validate English text
	if strings.TrimSpace(req.English) == "" {
		ve.Add("english", "English text is required")
	} else if len(req.English) > 200 {
		ve.Add("english", "English text must be less than 200 characters")
	}

	// Validate description
	if strings.TrimSpace(req.Description) == "" {
		ve.Add("description", "Description is required")
	} else if len(req.Description) > 1000 {
		ve.Add("description", "Description must be less than 1000 characters")
	}

	return ve
}

// ValidateVocabularyID validates a vocabulary ID
func ValidateVocabularyID(id string) *errors.ValidationErrors {
	ve := &errors.ValidationErrors{}

	if strings.TrimSpace(id) == "" {
		ve.Add("id", "Vocabulary ID is required")
	} else if len(id) > 100 {
		ve.Add("id", "Vocabulary ID must be less than 100 characters")
	}

	return ve
}

// ValidateWatchHistoryRequest validates a watch history request
func ValidateWatchHistoryRequest(req *models.WatchHistoryRequest) *errors.ValidationErrors {
	ve := &errors.ValidationErrors{}

	// Validate video ID
	if strings.TrimSpace(req.VideoID) == "" {
		ve.Add("video_id", "Video ID is required")
	}

	// Validate progress (0.0 to 1.0)
	if req.Progress < 0.0 || req.Progress > 1.0 {
		ve.Add("progress", "Progress must be between 0.0 and 1.0")
	}

	// Validate current time (must be non-negative)
	if req.CurrentTime < 0 {
		ve.Add("current_time", "Current time must be non-negative")
	}

	// Validate duration (must be positive)
	if req.Duration <= 0 {
		ve.Add("duration", "Duration must be positive")
	}

	// Validate that current time doesn't exceed duration
	if req.CurrentTime > req.Duration {
		ve.Add("current_time", "Current time cannot exceed duration")
	}

	return ve
}

// ValidateWatchHistoryID validates a watch history ID
func ValidateWatchHistoryID(id string) *errors.ValidationErrors {
	ve := &errors.ValidationErrors{}

	if strings.TrimSpace(id) == "" {
		ve.Add("id", "Watch history ID is required")
	}

	return ve
}
