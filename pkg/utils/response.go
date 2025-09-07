package utils

import (
	"encoding/json"
	"net/http"
)

// APIResponse represents a standard API response
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// WriteJSON writes a JSON response
func WriteJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// WriteError writes an error response
func WriteError(w http.ResponseWriter, statusCode int, message string) {
	response := APIResponse{
		Success: false,
		Error:   message,
	}
	WriteJSON(w, statusCode, response)
}

// WriteSuccess writes a success response
func WriteSuccess(w http.ResponseWriter, statusCode int, data interface{}, message string) {
	response := APIResponse{
		Success: true,
		Data:    data,
		Message: message,
	}
	WriteJSON(w, statusCode, response)
}
