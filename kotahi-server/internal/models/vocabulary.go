package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Vocabulary represents a Māori vocabulary word/phrase
type Vocabulary struct {
	ID          string `json:"id" bson:"_id,omitempty"`
	Maori       string `json:"maori" bson:"maori"`
	English     string `json:"english" bson:"english"`
	Description string `json:"description" bson:"description"`
}

// VocabularyRequest represents the request payload for creating/updating vocabulary
type VocabularyRequest struct {
	Maori       string `json:"maori" validate:"required,min=1,max=200"`
	English     string `json:"english" validate:"required,min=1,max=200"`
	Description string `json:"description" validate:"required,min=1,max=1000"`
}

// ToVocabulary converts a VocabularyRequest to a Vocabulary model
func (vr *VocabularyRequest) ToVocabulary() *Vocabulary {
	return &Vocabulary{
		Maori:       vr.Maori,
		English:     vr.English,
		Description: vr.Description,
	}
}

// GenerateID generates a unique ID for the vocabulary item
func (v *Vocabulary) GenerateID() {
	if v.ID == "" {
		// Always generate a unique ObjectID to avoid collisions
		v.ID = primitive.NewObjectID().Hex()
	}
}

// UpdateFromRequest updates the vocabulary item from a request
func (v *Vocabulary) UpdateFromRequest(vr *VocabularyRequest) {
	v.Maori = vr.Maori
	v.English = vr.English
	v.Description = vr.Description
}
