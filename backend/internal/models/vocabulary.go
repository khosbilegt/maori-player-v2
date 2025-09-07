package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Vocabulary represents a Māori vocabulary word/phrase
type Vocabulary struct {
	ID            string    `json:"id" bson:"_id,omitempty"`
	Maori         string    `json:"maori" bson:"maori"`
	English       string    `json:"english" bson:"english"`
	Pronunciation string    `json:"pronunciation" bson:"pronunciation"`
	Description   string    `json:"description" bson:"description"`
	CreatedAt     time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" bson:"updated_at"`
}

// VocabularyRequest represents the request payload for creating/updating vocabulary
type VocabularyRequest struct {
	Maori         string `json:"maori" validate:"required,min=1,max=200"`
	English       string `json:"english" validate:"required,min=1,max=200"`
	Pronunciation string `json:"pronunciation" validate:"required,min=1,max=200"`
	Description   string `json:"description" validate:"required,min=1,max=1000"`
}

// ToVocabulary converts a VocabularyRequest to a Vocabulary model
func (vr *VocabularyRequest) ToVocabulary() *Vocabulary {
	now := time.Now()
	return &Vocabulary{
		Maori:         vr.Maori,
		English:       vr.English,
		Pronunciation: vr.Pronunciation,
		Description:   vr.Description,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
}

// GenerateID generates a unique ID for the vocabulary item
func (v *Vocabulary) GenerateID() {
	if v.ID == "" {
		// Use the Māori word as base for ID, but make it URL-safe
		id := sanitizeForID(v.Maori)
		v.ID = id
	}
}

// sanitizeForID converts a string to a URL-safe ID
func sanitizeForID(input string) string {
	// Simple sanitization - in production you might want more sophisticated logic
	// This converts spaces to hyphens and removes special characters
	result := ""
	for _, char := range input {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') {
			result += string(char)
		} else if char == ' ' {
			result += "-"
		}
	}

	// If result is empty, generate a random ID
	if result == "" {
		result = primitive.NewObjectID().Hex()
	}

	return result
}

// UpdateFromRequest updates the vocabulary item from a request
func (v *Vocabulary) UpdateFromRequest(vr *VocabularyRequest) {
	v.Maori = vr.Maori
	v.English = vr.English
	v.Pronunciation = vr.Pronunciation
	v.Description = vr.Description
	v.UpdatedAt = time.Now()
}
