package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// WatchHistory represents a user's watch history entry
type WatchHistory struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID      string             `json:"user_id" bson:"user_id"`
	VideoID     string             `json:"video_id" bson:"video_id"`
	Progress    float64            `json:"progress" bson:"progress"`         // Progress as percentage (0.0 to 1.0)
	CurrentTime float64            `json:"current_time" bson:"current_time"` // Current time in seconds
	Duration    float64            `json:"duration" bson:"duration"`         // Total video duration in seconds
	Completed   bool               `json:"completed" bson:"completed"`       // Whether the video was fully watched
	LastWatched time.Time          `json:"last_watched" bson:"last_watched"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
}

// WatchHistoryRequest represents the request payload for creating/updating watch history
type WatchHistoryRequest struct {
	VideoID     string  `json:"video_id" validate:"required"`
	Progress    float64 `json:"progress" validate:"min=0,max=1"`
	CurrentTime float64 `json:"current_time" validate:"min=0"`
	Duration    float64 `json:"duration" validate:"min=0"`
	Completed   bool    `json:"completed"`
}

// WatchHistoryResponse represents the response for watch history operations
type WatchHistoryResponse struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	VideoID     string    `json:"video_id"`
	Progress    float64   `json:"progress"`
	CurrentTime float64   `json:"current_time"`
	Duration    float64   `json:"duration"`
	Completed   bool      `json:"completed"`
	LastWatched time.Time `json:"last_watched"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToWatchHistory converts a WatchHistoryRequest to WatchHistory
func (req *WatchHistoryRequest) ToWatchHistory(userID string) (*WatchHistory, error) {
	now := time.Now()
	watchHistory := &WatchHistory{
		UserID:      userID,
		VideoID:     req.VideoID,
		Progress:    req.Progress,
		CurrentTime: req.CurrentTime,
		Duration:    req.Duration,
		Completed:   req.Completed,
		LastWatched: now,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Auto-calculate completion based on progress
	if req.Progress >= 0.9 { // Consider 90% as completed
		watchHistory.Completed = true
	}

	return watchHistory, nil
}

// ToResponse converts WatchHistory to WatchHistoryResponse
func (wh *WatchHistory) ToResponse() *WatchHistoryResponse {
	return &WatchHistoryResponse{
		ID:          wh.ID.Hex(),
		UserID:      wh.UserID,
		VideoID:     wh.VideoID,
		Progress:    wh.Progress,
		CurrentTime: wh.CurrentTime,
		Duration:    wh.Duration,
		Completed:   wh.Completed,
		LastWatched: wh.LastWatched,
		CreatedAt:   wh.CreatedAt,
		UpdatedAt:   wh.UpdatedAt,
	}
}

// UpdateFromRequest updates WatchHistory from WatchHistoryRequest
func (wh *WatchHistory) UpdateFromRequest(req *WatchHistoryRequest) error {
	wh.Progress = req.Progress
	wh.CurrentTime = req.CurrentTime
	wh.Duration = req.Duration
	wh.Completed = req.Completed
	wh.LastWatched = time.Now()
	wh.UpdatedAt = time.Now()

	// Auto-calculate completion based on progress
	if req.Progress >= 0.9 {
		wh.Completed = true
	}

	return nil
}

// GenerateID generates a new ObjectID for WatchHistory
func (wh *WatchHistory) GenerateID() {
	wh.ID = primitive.NewObjectID()
}
