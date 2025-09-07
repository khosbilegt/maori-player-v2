package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// LearningList represents a user's learning list item
type LearningList struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	Text      string             `json:"text" bson:"text"`
	VideoID   string             `json:"video_id" bson:"video_id,omitempty"`
	Timestamp time.Time          `json:"timestamp" bson:"timestamp"`
	Status    string             `json:"status" bson:"status"` // "new", "learning", "learned"
	Notes     string             `json:"notes" bson:"notes,omitempty"`
}

// LearningListRequest represents the request payload for creating/updating learning list items
type LearningListRequest struct {
	Text    string `json:"text" validate:"required,min=1,max=500"`
	VideoID string `json:"video_id,omitempty"`
	Notes   string `json:"notes,omitempty" validate:"max=1000"`
}

// LearningListResponse represents the response payload for learning list items
type LearningListResponse struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Text      string    `json:"text"`
	VideoID   string    `json:"video_id,omitempty"`
	Timestamp time.Time `json:"timestamp"`
	Status    string    `json:"status"`
	Notes     string    `json:"notes,omitempty"`
}

// ToLearningListResponse converts a LearningList to LearningListResponse
func (l *LearningList) ToLearningListResponse() *LearningListResponse {
	return &LearningListResponse{
		ID:        l.ID.Hex(),
		UserID:    l.UserID.Hex(),
		Text:      l.Text,
		VideoID:   l.VideoID,
		Timestamp: l.Timestamp,
		Status:    l.Status,
		Notes:     l.Notes,
	}
}

// ToLearningList converts a LearningListRequest to LearningList
func (req *LearningListRequest) ToLearningList(userID primitive.ObjectID) *LearningList {
	status := "new"
	if req.Text == "" {
		status = "new"
	}

	return &LearningList{
		UserID:    userID,
		Text:      req.Text,
		VideoID:   req.VideoID,
		Timestamp: time.Now(),
		Status:    status,
		Notes:     req.Notes,
	}
}
