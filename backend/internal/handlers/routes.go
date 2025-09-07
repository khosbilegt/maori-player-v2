package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"video-player-backend/internal/database"
	"video-player-backend/internal/middleware"

	"github.com/gorilla/mux"
)

// SetupRoutes configures all routes for the application
func SetupRoutes(repo database.VideoRepository) *mux.Router {
	r := mux.NewRouter()

	log.Println("Setting up routes")

	// Apply middleware
	r.Use(middleware.Logging)
	r.Use(middleware.CORS)

	// Create handlers
	videoHandler := NewVideoHandler(repo)

	// API routes
	api := r.PathPrefix("/api/v1").Subrouter()

	// Video routes
	api.HandleFunc("/videos", videoHandler.GetVideos).Methods("GET")
	api.HandleFunc("/videos/{id}", videoHandler.GetVideo).Methods("GET")
	api.HandleFunc("/videos", videoHandler.CreateVideo).Methods("POST")
	api.HandleFunc("/videos/{id}", videoHandler.UpdateVideo).Methods("PUT")
	api.HandleFunc("/videos/{id}", videoHandler.DeleteVideo).Methods("DELETE")

	// Health check endpoint
	r.HandleFunc("/health", healthCheck).Methods("GET")

	return r
}

// healthCheck handles health check requests
func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "video-player-backend",
	})
}
