package main

import (
	"context"
	"log"
	"time"

	"video-player-backend/internal/config"
	"video-player-backend/internal/database"
	"video-player-backend/internal/models"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to MongoDB
	db, err := database.NewMongoDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer db.Close(context.Background())

	// Create video repository
	videoRepo := database.NewVideoRepository(db)

	// Sample video data
	sampleVideos := []models.VideoRequest{
		{
			Title:       "Te Tēpu: Season 10 Episode 6",
			Description: "Interactive Māori language learning video with synchronized transcripts and hover translations.",
			Thumbnail:   "https://www.dropbox.com/scl/fi/eji6eappnmm25kkq45r0x/tetepus10e6.jpg?rlkey=va30la6fq31i2y03mr0ykhj6v&st=oznsw98x&raw=1",
			Video:       "https://www.dropbox.com/scl/fi/r4nmatwmpqobjsi0gtaks/tetepus10e6.mp4?rlkey=kwrf1igeud9lz8l65mfg25qth&st=s2gzu1k1&raw=1",
			Subtitle:    "/tetepus10e6.vtt",
			Duration:    "2:34",
		},
		{
			Title:       "Tu Maori Ki Te Ao Pixie Williams (Te Reo Māori).mp4",
			Description: "Interactive Māori language learning video with synchronized transcripts and hover translations.",
			Thumbnail:   "https://i.ytimg.com/vi/2uON12nR25E/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgWihRMA8=&rs=AOn4CLA0MzfdFCTJpYlCyjHF4dtbLcJOkg",
			Video:       "https://www.dropbox.com/scl/fi/b713sznbtn3c64c5xuq63/pixie_williams.mp4?rlkey=eaj8tntadvvfcp5ybd4zuwyd0&st=jfx4wavp&raw=1",
			Subtitle:    "/pixie_williams.vtt",
			Duration:    "2:11",
		},
		{
			Title:       "Rahera Shortland strengthening and promoting the Maori language (Te Waka Toi Awards 2015)",
			Description: "Interactive Māori language learning video with synchronized transcripts and hover translations.",
			Thumbnail:   "https://i.ytimg.com/vi/TXMiuUbptSk/maxresdefault.jpg",
			Video:       "https://www.dropbox.com/scl/fi/abkr9353oajvvx4psx9qu/rahera_shortland.mp4?rlkey=375u515xmshf57m9ofrepjoeq&st=1zlyf18z&raw=1",
			Subtitle:    "/rahera_shortland.vtt",
			Duration:    "2:54",
		},
		{
			Title:       "Te Tepu Season 10：Episode 23 - Māori Music",
			Description: "this is the description",
			Thumbnail:   "https://i.ytimg.com/vi/2uON12nR25E/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgWihRMA8=&rs=AOn4CLA0MzfdFCTJpYlCyjHF4dtbLcJOkg",
			Video:       "https://khosbilegt.github.io/maori-player/tetepus10e23.mp4",
			Subtitle:    "/tetepus10e23.vtt",
			Duration:    "3:42",
		},
		{
			Title:       "Te Tepu Season 9：Episode 3 - Te Arawa",
			Description: "this is the description",
			Thumbnail:   "https://i.ytimg.com/vi/2uON12nR25E/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgWihRMA8=&rs=AOn4CLA0MzfdFCTJpYlCyjHF4dtbLcJOkg",
			Video:       "tetepus9e3.mp4",
			Subtitle:    "/tetepus9e3.vtt",
			Duration:    "4:29",
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	log.Println("Starting to seed database with sample videos...")

	// Insert sample videos
	for i, videoReq := range sampleVideos {
		video := videoReq.ToVideo()
		// Set specific IDs to match the original library.json
		switch i {
		case 0:
			video.ID = "tetepus10e6"
		case 1:
			video.ID = "pixie-williams"
		case 2:
			video.ID = "rahera_shortland"
		case 3:
			video.ID = "maori-music"
		case 4:
			video.ID = "tetepus9e3"
		}

		err := videoRepo.Create(ctx, video)
		if err != nil {
			log.Printf("Failed to create video %d (%s): %v", i+1, video.Title, err)
		} else {
			log.Printf("Successfully created video %d: %s (ID: %s)", i+1, video.Title, video.ID)
		}
	}

	log.Println("Database seeding completed!")
}
