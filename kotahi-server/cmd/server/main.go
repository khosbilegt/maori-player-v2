package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"video-player-backend/internal/config"
	"video-player-backend/internal/database"
	"video-player-backend/internal/handlers"
	"video-player-backend/internal/middleware"

	"github.com/joho/godotenv"
)

// loadEnv attempts to load .env files from likely locations and logs what it finds
func loadEnv() {
	loaded := []string{}

	// Try current working directory
	for _, name := range []string{".env.local", ".env"} {
		if err := godotenv.Overload(name); err == nil {
			loaded = append(loaded, name)
		}
	}

	// Try executable directory
	if exePath, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exePath)
		for _, name := range []string{".env.local", ".env"} {
			path := filepath.Join(exeDir, name)
			if err := godotenv.Overload(path); err == nil {
				loaded = append(loaded, path)
			}
		}
	}

	if len(loaded) == 0 {
		log.Println("No .env files loaded (proceeding with OS environment and defaults)")
		return
	}
	log.Printf("Loaded env files: %v", loaded)
}

func main() {
	// Load environment variables from .env files for local development
	loadEnv()

	// Load configuration
	cfg := config.LoadConfig()

	// Log a brief summary of effective configuration (non-sensitive)
	log.Printf("Config: host=%s port=%s db=%s email_domain_set=%t",
		cfg.Server.Host,
		cfg.Server.Port,
		cfg.Database.Database,
		cfg.Email.Domain != "",
	)

	// Connect to MongoDB
	db, err := database.NewMongoDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer db.Close(context.Background())

	// Create repositories
	videoRepo := database.NewVideoRepository(db)
	userRepo := database.NewUserRepository(db)
	vocabRepo := database.NewVocabularyRepository(db)
	vocabIndexRepo := database.NewVocabularyIndexRepository(db.Database)
	watchHistoryRepo := database.NewWatchHistoryRepository(db)
	playlistRepo := database.NewPlaylistRepository(db)

	// Setup routes
	router := handlers.SetupRoutes(cfg, db, videoRepo, userRepo, vocabRepo, vocabIndexRepo, watchHistoryRepo, playlistRepo)

	// Create server
	server := &http.Server{
		Addr:    fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler: middleware.EnableCORS(router),
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on %s:%s", cfg.Server.Host, cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Server failed to start:", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}
