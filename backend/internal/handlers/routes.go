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
func SetupRoutes(cfg *config.Config, videoRepo database.VideoRepository, userRepo database.UserRepository, vocabRepo database.VocabularyRepository, watchHistoryRepo database.WatchHistoryRepository) *mux.Router {
	r := mux.NewRouter()

	log.Println("Setting up routes")

	// Apply middleware
	r.Use(middleware.Logging)

	// Create JWT manager
	jwtManager := jwtutils.NewJWTManager(&cfg.JWT)

	// Create handlers
	videoHandler := NewVideoHandler(videoRepo)
	authHandler := NewAuthHandler(userRepo, jwtManager)
	vocabularyHandler := NewVocabularyHandler(vocabRepo)
	watchHistoryHandler := NewWatchHistoryHandler(watchHistoryRepo, videoRepo)
	vttHandler := NewVTTUploadHandler("./uploads/vtt")

	// API routes
	api := r.PathPrefix("/api/v1").Subrouter()

	// Public authentication routes
	api.HandleFunc("/auth/register", authHandler.Register).Methods("POST")
	api.HandleFunc("/auth/login", authHandler.Login).Methods("POST")

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

	// Vocabulary routes (public for now, but can be made protected if needed)
	api.HandleFunc("/vocabulary", vocabularyHandler.GetVocabularies).Methods("GET")
	api.HandleFunc("/vocabulary/{id}", vocabularyHandler.GetVocabulary).Methods("GET")
	api.HandleFunc("/vocabulary", vocabularyHandler.CreateVocabulary).Methods("POST")
	api.HandleFunc("/vocabulary/{id}", vocabularyHandler.UpdateVocabulary).Methods("PUT")
	api.HandleFunc("/vocabulary/{id}", vocabularyHandler.DeleteVocabulary).Methods("DELETE")
	api.HandleFunc("/vocabulary/search", vocabularyHandler.SearchVocabularies).Methods("GET")

	// Watch history routes (protected - require authentication)
	protected.HandleFunc("/watch-history", watchHistoryHandler.GetWatchHistory).Methods("GET")
	protected.HandleFunc("/watch-history/video", watchHistoryHandler.GetWatchHistoryByVideo).Methods("GET")
	protected.HandleFunc("/watch-history", watchHistoryHandler.CreateOrUpdateWatchHistory).Methods("POST")
	protected.HandleFunc("/watch-history", watchHistoryHandler.DeleteWatchHistory).Methods("DELETE")
	protected.HandleFunc("/watch-history/recent", watchHistoryHandler.GetRecentWatched).Methods("GET")
	protected.HandleFunc("/watch-history/completed", watchHistoryHandler.GetCompletedVideos).Methods("GET")

	// VTT file routes (protected - require authentication)
	protected.HandleFunc("/vtt/upload", vttHandler.UploadVTT).Methods("POST")
	protected.HandleFunc("/vtt/list", vttHandler.ListVTTFiles).Methods("GET")
	protected.HandleFunc("/vtt/delete", vttHandler.DeleteVTTFile).Methods("DELETE")

	// Static file serving for uploaded VTT files
	api.PathPrefix("/uploads/vtt/").Handler(http.StripPrefix("/api/v1/uploads/vtt/", http.FileServer(http.Dir("./uploads/vtt/"))))

	// Health check endpoint
	r.HandleFunc("/health", healthCheck).Methods("GET")

	// Seed endpoint (for development)
	r.HandleFunc("/seed", seedDatabase).Methods("POST")

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

// seedDatabase handles seeding the database with sample data
func seedDatabase(w http.ResponseWriter, r *http.Request) {
	// This is a simple seed endpoint - in production, you'd want proper authentication
	// and more sophisticated seeding logic

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Use the seed command: go run cmd/seed/main.go",
		"note":    "This endpoint is for development purposes only",
	})
}
