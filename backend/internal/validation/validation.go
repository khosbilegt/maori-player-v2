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
