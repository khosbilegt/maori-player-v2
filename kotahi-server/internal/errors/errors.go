package errors

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// APIError represents a standardized API error response
type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// Error implements the error interface
func (e *APIError) Error() string {
	return e.Message
}

// Predefined error types
var (
	// Video not found
	ErrVideoNotFound = &APIError{
		Code:    "VIDEO_NOT_FOUND",
		Message: "Video not found",
	}

	// Invalid request
	ErrInvalidRequest = &APIError{
		Code:    "INVALID_REQUEST",
		Message: "Invalid request",
	}

	// Internal server error
	ErrInternalServer = &APIError{
		Code:    "INTERNAL_SERVER_ERROR",
		Message: "Internal server error",
	}

	// Database error
	ErrDatabase = &APIError{
		Code:    "DATABASE_ERROR",
		Message: "Database operation failed",
	}

	// Validation error
	ErrValidation = &APIError{
		Code:    "VALIDATION_ERROR",
		Message: "Validation failed",
	}

	// Authentication errors
	ErrUnauthorized = &APIError{
		Code:    "UNAUTHORIZED",
		Message: "Unauthorized access",
	}

	ErrInvalidCredentials = &APIError{
		Code:    "INVALID_CREDENTIALS",
		Message: "Invalid email or password",
	}

	ErrUserAlreadyExists = &APIError{
		Code:    "USER_ALREADY_EXISTS",
		Message: "User with this email or username already exists",
	}

	ErrUserNotFound = &APIError{
		Code:    "USER_NOT_FOUND",
		Message: "User not found",
	}

	ErrInvalidToken = &APIError{
		Code:    "INVALID_TOKEN",
		Message: "Invalid or expired token",
	}

	// Vocabulary not found
	ErrVocabularyNotFound = &APIError{
		Code:    "VOCABULARY_NOT_FOUND",
		Message: "Vocabulary not found",
	}

	// Watch history not found
	ErrWatchHistoryNotFound = &APIError{
		Code:    "WATCH_HISTORY_NOT_FOUND",
		Message: "Watch history not found",
	}

	// Insufficient permissions
	ErrInsufficientPermissions = &APIError{
		Code:    "INSUFFICIENT_PERMISSIONS",
		Message: "Insufficient permissions",
	}

	// Invalid ID
	ErrInvalidID = &APIError{
		Code:    "INVALID_ID",
		Message: "Invalid ID format",
	}

	// Not found
	ErrNotFound = &APIError{
		Code:    "NOT_FOUND",
		Message: "Resource not found",
	}

	// Forbidden
	ErrForbidden = &APIError{
		Code:    "FORBIDDEN",
		Message: "Access forbidden",
	}
)

// NewAPIError creates a new API error with custom message
func NewAPIError(code, message string) *APIError {
	return &APIError{
		Code:    code,
		Message: message,
	}
}

// NewAPIErrorWithDetails creates a new API error with custom message and details
func NewAPIErrorWithDetails(code, message, details string) *APIError {
	return &APIError{
		Code:    code,
		Message: message,
		Details: details,
	}
}

// WriteError writes an error response to the HTTP response writer
func WriteError(w http.ResponseWriter, statusCode int, err *APIError) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(err)
}

// WriteErrorResponse writes a standardized error response
func WriteErrorResponse(w http.ResponseWriter, err error) {
	switch e := err.(type) {
	case *APIError:
		statusCode := getStatusCodeFromError(e)
		WriteError(w, statusCode, e)
	default:
		// Handle unknown errors
		apiErr := NewAPIErrorWithDetails(
			ErrInternalServer.Code,
			ErrInternalServer.Message,
			e.Error(),
		)
		WriteError(w, http.StatusInternalServerError, apiErr)
	}
}

// getStatusCodeFromError maps error codes to HTTP status codes
func getStatusCodeFromError(err *APIError) int {
	switch err.Code {
	case "VIDEO_NOT_FOUND", "USER_NOT_FOUND", "VOCABULARY_NOT_FOUND", "WATCH_HISTORY_NOT_FOUND":
		return http.StatusNotFound
	case "INVALID_REQUEST", "VALIDATION_ERROR":
		return http.StatusBadRequest
	case "UNAUTHORIZED", "INVALID_TOKEN":
		return http.StatusUnauthorized
	case "INVALID_CREDENTIALS":
		return http.StatusUnauthorized
	case "INSUFFICIENT_PERMISSIONS":
		return http.StatusForbidden
	case "USER_ALREADY_EXISTS":
		return http.StatusConflict
	case "DATABASE_ERROR", "INTERNAL_SERVER_ERROR":
		return http.StatusInternalServerError
	default:
		return http.StatusInternalServerError
	}
}

// WrapError wraps a standard error into an APIError
func WrapError(err error, apiErr *APIError) *APIError {
	return NewAPIErrorWithDetails(apiErr.Code, apiErr.Message, err.Error())
}

// ValidationError represents validation errors
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationErrors represents multiple validation errors
type ValidationErrors struct {
	Errors []ValidationError `json:"errors"`
}

// Add adds a validation error
func (ve *ValidationErrors) Add(field, message string) {
	ve.Errors = append(ve.Errors, ValidationError{
		Field:   field,
		Message: message,
	})
}

// HasErrors returns true if there are validation errors
func (ve *ValidationErrors) HasErrors() bool {
	return len(ve.Errors) > 0
}

// Error implements the error interface
func (ve *ValidationErrors) Error() string {
	return fmt.Sprintf("validation failed: %d errors", len(ve.Errors))
}

// WriteValidationError writes validation errors to the HTTP response writer
func WriteValidationError(w http.ResponseWriter, ve *ValidationErrors) {
	apiErr := NewAPIErrorWithDetails(
		ErrValidation.Code,
		ErrValidation.Message,
		"One or more validation errors occurred",
	)

	response := struct {
		*APIError
		ValidationErrors []ValidationError `json:"validation_errors"`
	}{
		APIError:         apiErr,
		ValidationErrors: ve.Errors,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(response)
}
