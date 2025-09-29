package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"

	"video-player-backend/internal/services"
)

// ContactHandler handles contact-related requests
type ContactHandler struct {
	emailService *services.EmailService
}

// NewContactHandler creates a new contact handler
func NewContactHandler(emailService *services.EmailService) *ContactHandler {
	return &ContactHandler{
		emailService: emailService,
	}
}

// ContactRequest represents the contact form data
type ContactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

// ContactResponse represents the response from contact submission
type ContactResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	ID      string `json:"id,omitempty"`
}

// SubmitContact handles contact form submissions
func (ch *ContactHandler) SubmitContact(w http.ResponseWriter, r *http.Request) {
	var req ContactRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding contact request: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" || req.Subject == "" || req.Message == "" {
		http.Error(w, "Name, email, subject, and message are required", http.StatusBadRequest)
		return
	}

	// Validate email format
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(req.Email) {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	// Validate message length (prevent spam)
	if len(req.Message) < 10 {
		http.Error(w, "Message must be at least 10 characters long", http.StatusBadRequest)
		return
	}

	if len(req.Message) > 5000 {
		http.Error(w, "Message must be less than 5000 characters", http.StatusBadRequest)
		return
	}

	// Send email
	emailID, err := ch.emailService.SendContactEmail(
		req.Name,
		req.Email,
		req.Subject,
		req.Message,
	)

	if err != nil {
		log.Printf("Error sending contact email: %v", err)
		http.Error(w, "Failed to send message", http.StatusInternalServerError)
		return
	}

	log.Printf("Contact email sent successfully with ID: %s", emailID)

	// Return success response
	response := ContactResponse{
		Success: true,
		Message: "Message sent successfully",
		ID:      emailID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
