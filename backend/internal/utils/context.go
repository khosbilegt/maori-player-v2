package utils

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

// ContextWithTimeout creates a context with timeout
func ContextWithTimeout() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 10*time.Second)
}

// WriteJSONResponse writes a JSON response to the HTTP response writer
func WriteJSONResponse(w http.ResponseWriter, data interface{}) error {
	return json.NewEncoder(w).Encode(data)
}
