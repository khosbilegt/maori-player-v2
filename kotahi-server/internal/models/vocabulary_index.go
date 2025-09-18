package models

import (
	"time"
)

// VocabularyIndex represents an indexed vocabulary word/phrase in a video transcript
type VocabularyIndex struct {
	ID          string    `json:"id" bson:"_id,omitempty"`
	VideoID     string    `json:"video_id" bson:"video_id"`
	Vocabulary  string    `json:"vocabulary" bson:"vocabulary"` // The Māori word/phrase
	English     string    `json:"english" bson:"english"`       // English translation
	Description string    `json:"description" bson:"description"`
	StartTime   float64   `json:"start_time" bson:"start_time"`   // Start time in seconds
	EndTime     float64   `json:"end_time" bson:"end_time"`       // End time in seconds
	Transcript  string    `json:"transcript" bson:"transcript"`   // The full transcript line
	LineNumber  int       `json:"line_number" bson:"line_number"` // Line number in the transcript
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
}

// VocabularyIndexRequest represents the request payload for vocabulary index operations
type VocabularyIndexRequest struct {
	VideoID     string  `json:"video_id" validate:"required"`
	Vocabulary  string  `json:"vocabulary" validate:"required"`
	English     string  `json:"english" validate:"required"`
	Description string  `json:"description"`
	StartTime   float64 `json:"start_time" validate:"required"`
	EndTime     float64 `json:"end_time" validate:"required"`
	Transcript  string  `json:"transcript" validate:"required"`
	LineNumber  int     `json:"line_number" validate:"required"`
}

// VocabularySearchResult represents the result of a vocabulary search
type VocabularySearchResult struct {
	Vocabulary  string            `json:"vocabulary"`
	English     string            `json:"english"`
	Description string            `json:"description"`
	Occurrences []VocabularyIndex `json:"occurrences"`
	TotalCount  int               `json:"total_count"`
}

// GenerateID generates a unique ID for the vocabulary index
func (vi *VocabularyIndex) GenerateID() {
	if vi.ID == "" {
		vi.ID = sanitizeForID(vi.Vocabulary + "_" + vi.VideoID)
	}
}

// ToVocabularyIndex converts a VocabularyIndexRequest to a VocabularyIndex model
func (vir *VocabularyIndexRequest) ToVocabularyIndex() *VocabularyIndex {
	return &VocabularyIndex{
		VideoID:     vir.VideoID,
		Vocabulary:  vir.Vocabulary,
		English:     vir.English,
		Description: vir.Description,
		StartTime:   vir.StartTime,
		EndTime:     vir.EndTime,
		Transcript:  vir.Transcript,
		LineNumber:  vir.LineNumber,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}
