package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"video-player-backend/internal/database"
	"video-player-backend/internal/errors"
	"video-player-backend/internal/models"
	"video-player-backend/internal/utils"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// LearningListHandler handles learning list operations
type LearningListHandler struct {
	db *database.MongoDB
}

// NewLearningListHandler creates a new learning list handler
func NewLearningListHandler(db *database.MongoDB) *LearningListHandler {
	return &LearningListHandler{
		db: db,
	}
}

// CreateLearningListItem creates a new learning list item
func (h *LearningListHandler) CreateLearningListItem(w http.ResponseWriter, r *http.Request) {
	// Get user ID from JWT token
	userID, err := h.getUserIDFromToken(r)
	if err != nil {
		errors.WriteErrorResponse(w, err)
		return
	}

	var req models.LearningListRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Basic validation
	if req.Text == "" {
		errors.WriteErrorResponse(w, errors.NewAPIError("validation_error", "Text is required"))
		return
	}

	// Convert user ID to ObjectID
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidID)
		return
	}

	// Create learning list item
	item := req.ToLearningList(userObjectID)

	ctx := r.Context()
	if err := h.db.CreateLearningListItem(ctx, item); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInternalServer)
		return
	}

	// Return the created item
	response := item.ToLearningListResponse()
	utils.WriteJSONResponse(w, map[string]interface{}{
		"data": response,
	})
}

// GetLearningList retrieves all learning list items for the authenticated user
func (h *LearningListHandler) GetLearningList(w http.ResponseWriter, r *http.Request) {
	// Get user ID from JWT token
	userID, err := h.getUserIDFromToken(r)
	if err != nil {
		errors.WriteErrorResponse(w, err)
		return
	}

	// Convert user ID to ObjectID
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidID)
		return
	}

	// Get query parameters
	status := r.URL.Query().Get("status")
	videoID := r.URL.Query().Get("video_id")

	ctx := r.Context()
	var items []*models.LearningList

	if status != "" {
		// Get items by status
		items, err = h.db.GetLearningListByStatus(ctx, userObjectID, status)
	} else if videoID != "" {
		// Get items by video ID
		items, err = h.db.GetLearningListByVideoID(ctx, userObjectID, videoID)
	} else {
		// Get all items
		items, err = h.db.GetLearningListByUserID(ctx, userObjectID)
	}

	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInternalServer)
		return
	}

	// Convert to response format
	var responses []*models.LearningListResponse
	for _, item := range items {
		responses = append(responses, item.ToLearningListResponse())
	}

	utils.WriteJSONResponse(w, map[string]interface{}{
		"data": responses,
	})
}

// GetLearningListItem retrieves a specific learning list item
func (h *LearningListHandler) GetLearningListItem(w http.ResponseWriter, r *http.Request) {
	// Get user ID from JWT token
	userID, err := h.getUserIDFromToken(r)
	if err != nil {
		errors.WriteErrorResponse(w, err)
		return
	}

	// Get item ID from URL
	vars := mux.Vars(r)
	itemID := vars["id"]

	// Convert IDs to ObjectID
	itemObjectID, err := primitive.ObjectIDFromHex(itemID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidID)
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidID)
		return
	}

	ctx := r.Context()
	item, err := h.db.GetLearningListItemByID(ctx, itemObjectID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrNotFound)
		return
	}

	// Check if the item belongs to the user
	if item.UserID != userObjectID {
		errors.WriteErrorResponse(w, errors.ErrForbidden)
		return
	}

	response := item.ToLearningListResponse()
	utils.WriteJSONResponse(w, map[string]interface{}{
		"data": response,
	})
}

// UpdateLearningListItem updates a learning list item
func (h *LearningListHandler) UpdateLearningListItem(w http.ResponseWriter, r *http.Request) {
	// Get user ID from JWT token
	userID, err := h.getUserIDFromToken(r)
	if err != nil {
		errors.WriteErrorResponse(w, err)
		return
	}

	// Get item ID from URL
	vars := mux.Vars(r)
	itemID := vars["id"]

	// Convert IDs to ObjectID
	itemObjectID, err := primitive.ObjectIDFromHex(itemID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidID)
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidID)
		return
	}

	// Check if item exists and belongs to user
	ctx := r.Context()
	item, err := h.db.GetLearningListItemByID(ctx, itemObjectID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrNotFound)
		return
	}

	if item.UserID != userObjectID {
		errors.WriteErrorResponse(w, errors.ErrForbidden)
		return
	}

	// Parse update request
	var updateReq struct {
		Text   string `json:"text,omitempty"`
		Status string `json:"status,omitempty"`
		Notes  string `json:"notes,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&updateReq); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Build update document
	update := bson.M{}
	if updateReq.Text != "" {
		update["text"] = updateReq.Text
	}
	if updateReq.Status != "" {
		// Validate status
		validStatuses := []string{"new", "learning", "learned"}
		isValid := false
		for _, status := range validStatuses {
			if updateReq.Status == status {
				isValid = true
				break
			}
		}
		if !isValid {
			errors.WriteErrorResponse(w, errors.NewAPIError("invalid_status", "Status must be one of: new, learning, learned"))
			return
		}
		update["status"] = updateReq.Status
	}
	if updateReq.Notes != "" {
		update["notes"] = updateReq.Notes
	}

	// Add timestamp for update
	update["updated_at"] = time.Now()

	// Update the item
	if err := h.db.UpdateLearningListItem(ctx, itemObjectID, update); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInternalServer)
		return
	}

	// Get updated item
	updatedItem, err := h.db.GetLearningListItemByID(ctx, itemObjectID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInternalServer)
		return
	}

	response := updatedItem.ToLearningListResponse()
	utils.WriteJSONResponse(w, map[string]interface{}{
		"data": response,
	})
}

// DeleteLearningListItem deletes a learning list item
func (h *LearningListHandler) DeleteLearningListItem(w http.ResponseWriter, r *http.Request) {
	// Get user ID from JWT token
	userID, err := h.getUserIDFromToken(r)
	if err != nil {
		errors.WriteErrorResponse(w, err)
		return
	}

	// Get item ID from URL
	vars := mux.Vars(r)
	itemID := vars["id"]

	// Convert IDs to ObjectID
	itemObjectID, err := primitive.ObjectIDFromHex(itemID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidID)
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidID)
		return
	}

	// Check if item exists and belongs to user
	ctx := r.Context()
	item, err := h.db.GetLearningListItemByID(ctx, itemObjectID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrNotFound)
		return
	}

	if item.UserID != userObjectID {
		errors.WriteErrorResponse(w, errors.ErrForbidden)
		return
	}

	// Delete the item
	if err := h.db.DeleteLearningListItem(ctx, itemObjectID); err != nil {
		errors.WriteErrorResponse(w, errors.ErrInternalServer)
		return
	}

	utils.WriteJSONResponse(w, map[string]interface{}{
		"message": "Learning list item deleted successfully",
	})
}

// GetLearningListStats retrieves statistics for the user's learning list
func (h *LearningListHandler) GetLearningListStats(w http.ResponseWriter, r *http.Request) {
	// Get user ID from JWT token
	userID, err := h.getUserIDFromToken(r)
	if err != nil {
		errors.WriteErrorResponse(w, err)
		return
	}

	// Convert user ID to ObjectID
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInvalidID)
		return
	}

	ctx := r.Context()

	// Get all items for the user
	allItems, err := h.db.GetLearningListByUserID(ctx, userObjectID)
	if err != nil {
		errors.WriteErrorResponse(w, errors.ErrInternalServer)
		return
	}

	// Calculate statistics
	stats := map[string]interface{}{
		"total":     len(allItems),
		"new":       0,
		"learning":  0,
		"learned":   0,
		"this_week": 0,
	}

	// Count by status and this week
	weekAgo := time.Now().AddDate(0, 0, -7)
	for _, item := range allItems {
		switch item.Status {
		case "new":
			stats["new"] = stats["new"].(int) + 1
		case "learning":
			stats["learning"] = stats["learning"].(int) + 1
		case "learned":
			stats["learned"] = stats["learned"].(int) + 1
		}

		// Count items added this week
		if item.Timestamp.After(weekAgo) {
			stats["this_week"] = stats["this_week"].(int) + 1
		}
	}

	utils.WriteJSONResponse(w, map[string]interface{}{
		"data": stats,
	})
}

// getUserIDFromToken extracts user ID from request context populated by AuthMiddleware
func (h *LearningListHandler) getUserIDFromToken(r *http.Request) (string, error) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok || userID == "" {
		return "", errors.ErrUnauthorized
	}
	return userID, nil
}
