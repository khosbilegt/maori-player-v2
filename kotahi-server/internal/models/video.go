package models

import (
	"crypto/rand"
	"encoding/hex"
)

// Video represents a video object
type Video struct {
	ID          string `json:"id" bson:"_id,omitempty"`
	Title       string `json:"title" bson:"title"`
	Description string `json:"description" bson:"description"`
	Thumbnail   string `json:"thumbnail" bson:"thumbnail"`
	Video       string `json:"video" bson:"video"`
	Subtitle    string `json:"subtitle" bson:"subtitle"`
	Duration    string `json:"duration" bson:"duration"`
}

// VideoRequest represents the request payload for creating/updating videos
type VideoRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	Thumbnail   string `json:"thumbnail"`
	Video       string `json:"video" validate:"required"`
	Subtitle    string `json:"subtitle"`
	Duration    string `json:"duration"`
}

// ToVideo converts VideoRequest to Video
func (vr *VideoRequest) ToVideo() *Video {
	return &Video{
		Title:       vr.Title,
		Description: vr.Description,
		Thumbnail:   vr.Thumbnail,
		Video:       vr.Video,
		Subtitle:    vr.Subtitle,
		Duration:    vr.Duration,
	}
}

// GenerateID generates a new random ID as string
func (v *Video) GenerateID() {
	if v.ID == "" {
		bytes := make([]byte, 12)
		rand.Read(bytes)
		v.ID = hex.EncodeToString(bytes)
	}
}
