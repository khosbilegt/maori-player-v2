package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"video-player-backend/internal/services"
)

// FeedbackHandler handles feedback-related requests
type FeedbackHandler struct {
	emailService *services.EmailService
}

// NewFeedbackHandler creates a new feedback handler
func NewFeedbackHandler(emailService *services.EmailService) *FeedbackHandler {
	return &FeedbackHandler{
		emailService: emailService,
	}
}

// FeedbackRequest represents the feedback form data
type FeedbackRequest struct {
	Email        string `json:"email"`
	FeedbackType string `json:"feedback_type"`
	Title        string `json:"title"`
	Message      string `json:"message"`
	Rating       string `json:"rating"`
}

// FeedbackResponse represents the response from feedback submission
type FeedbackResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	ID      string `json:"id,omitempty"`
}

// SubmitFeedback handles feedback form submissions
func (fh *FeedbackHandler) SubmitFeedback(w http.ResponseWriter, r *http.Request) {
	var req FeedbackRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding feedback request: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Title == "" || req.Message == "" {
		http.Error(w, "Title and message are required", http.StatusBadRequest)
		return
	}

	// Validate feedback type
	validTypes := map[string]bool{
		"bug":         true,
		"feature":     true,
		"improvement": true,
		"usability":   true,
		"content":     true,
		"other":       true,
	}

	if req.FeedbackType != "" && !validTypes[req.FeedbackType] {
		http.Error(w, "Invalid feedback type", http.StatusBadRequest)
		return
	}

	// Send email
	emailID, err := fh.emailService.SendFeedbackEmail(
		req.Email,
		req.FeedbackType,
		req.Title,
		req.Message,
		req.Rating,
	)

	if err != nil {
		log.Printf("Error sending feedback email: %v", err)
		http.Error(w, "Failed to send feedback", http.StatusInternalServerError)
		return
	}

	log.Printf("Feedback email sent successfully with ID: %s", emailID)

	// Return success response
	response := FeedbackResponse{
		Success: true,
		Message: "Feedback submitted successfully",
		ID:      emailID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// TestEmail sends a test email (for admin testing)
func (fh *FeedbackHandler) TestEmail(w http.ResponseWriter, r *http.Request) {
	emailID, err := fh.emailService.SendTestEmail()

	if err != nil {
		log.Printf("Error sending test email: %v", err)
		http.Error(w, "Failed to send test email", http.StatusInternalServerError)
		return
	}

	log.Printf("Test email sent successfully with ID: %s", emailID)

	response := FeedbackResponse{
		Success: true,
		Message: "Test email sent successfully",
		ID:      emailID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
