package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"video-player-backend/internal/config"
	"video-player-backend/internal/database"
	"video-player-backend/internal/middleware"
	jwtutils "video-player-backend/internal/utils"

	"github.com/gorilla/mux"
)

// SetupRoutes configures all routes for the application
func SetupRoutes(cfg *config.Config, videoRepo database.VideoRepository, userRepo database.UserRepository) *mux.Router {
	r := mux.NewRouter()

	log.Println("Setting up routes")

	// Apply middleware
	r.Use(middleware.Logging)
	r.Use(middleware.CORS)

	// Create JWT manager
	jwtManager := jwtutils.NewJWTManager(&cfg.JWT)

	// Create handlers
	videoHandler := NewVideoHandler(videoRepo)
	authHandler := NewAuthHandler(userRepo, jwtManager)

	// API routes
	api := r.PathPrefix("/api/v1").Subrouter()

	// Public authentication routes
	api.HandleFunc("/auth/register", authHandler.Register).Methods("POST")
	api.HandleFunc("/auth/register", handleOptions).Methods("OPTIONS")
	api.HandleFunc("/auth/login", authHandler.Login).Methods("POST")
	api.HandleFunc("/auth/login", handleOptions).Methods("OPTIONS")

	// Protected routes (require authentication)
	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware(jwtManager))

	// User profile routes
	protected.HandleFunc("/auth/profile", authHandler.GetProfile).Methods("GET")
	protected.HandleFunc("/auth/profile", authHandler.UpdateProfile).Methods("PUT")

	// Video routes (public for now, but can be made protected if needed)
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

// handleOptions handles OPTIONS requests for CORS preflight
func handleOptions(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}
