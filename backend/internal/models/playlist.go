package models

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e *ValidationError) Error() string {
	return e.Message
}

// Playlist represents a playlist object
type Playlist struct {
	ID          string    `json:"id" bson:"_id,omitempty"`
	Name        string    `json:"name" bson:"name"`
	Description string    `json:"description" bson:"description"`
	UserID      string    `json:"user_id" bson:"user_id"`     // Owner of the playlist
	VideoIDs    []string  `json:"video_ids" bson:"video_ids"` // Array of video IDs
	IsPublic    bool      `json:"is_public" bson:"is_public"` // Whether playlist is public or private
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
}

// PlaylistRequest represents the request payload for creating/updating playlists
type PlaylistRequest struct {
	Name        string   `json:"name" validate:"required,min=1,max=100"`
	Description string   `json:"description" validate:"max=500"`
	VideoIDs    []string `json:"video_ids" validate:"dive,required"`
	IsPublic    bool     `json:"is_public"`
}

// PlaylistWithVideos represents a playlist with populated video data
type PlaylistWithVideos struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	UserID      string    `json:"user_id"`
	Videos      []Video   `json:"videos"` // Populated video objects
	IsPublic    bool      `json:"is_public"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToPlaylist converts PlaylistRequest to Playlist
func (pr *PlaylistRequest) ToPlaylist(userID string) *Playlist {
	return &Playlist{
		Name:        pr.Name,
		Description: pr.Description,
		UserID:      userID,
		VideoIDs:    pr.VideoIDs,
		IsPublic:    pr.IsPublic,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

// GenerateID generates a new random ID as string
func (p *Playlist) GenerateID() {
	if p.ID == "" {
		bytes := make([]byte, 12)
		rand.Read(bytes)
		p.ID = hex.EncodeToString(bytes)
	}
}

// AddVideo adds a video ID to the playlist
func (p *Playlist) AddVideo(videoID string) {
	// Check if video already exists in playlist
	for _, id := range p.VideoIDs {
		if id == videoID {
			return // Video already exists
		}
	}
	p.VideoIDs = append(p.VideoIDs, videoID)
	p.UpdatedAt = time.Now()
}

// RemoveVideo removes a video ID from the playlist
func (p *Playlist) RemoveVideo(videoID string) {
	for i, id := range p.VideoIDs {
		if id == videoID {
			p.VideoIDs = append(p.VideoIDs[:i], p.VideoIDs[i+1:]...)
			p.UpdatedAt = time.Now()
			return
		}
	}
}

// ReorderVideos reorders videos in the playlist
func (p *Playlist) ReorderVideos(videoIDs []string) {
	p.VideoIDs = videoIDs
	p.UpdatedAt = time.Now()
}
