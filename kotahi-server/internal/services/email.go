package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"video-player-backend/internal/config"

	"github.com/mailgun/mailgun-go/v4"
)

// EmailService handles email operations
type EmailService struct {
	config *config.EmailConfig
	mg     *mailgun.MailgunImpl
}

// NewEmailService creates a new email service
func NewEmailService(cfg *config.EmailConfig) *EmailService {
	// Validate required configuration
	config.LoadConfig()
	if cfg.Domain == "" || cfg.APIKey == "" || cfg.FromEmail == "" || cfg.ToEmail == "" {
		log.Printf("WARNING: Email configuration is incomplete. Email functionality will not work.")
		log.Printf("Missing configuration: Domain=%s, APIKey=%s, FromEmail=%s, ToEmail=%s",
			cfg.Domain,
			cfg.APIKey,
			cfg.FromEmail,
			cfg.ToEmail)
	}

	mg := mailgun.NewMailgun(cfg.Domain, cfg.APIKey)

	return &EmailService{
		config: cfg,
		mg:     mg,
	}
}

// SendContactEmail sends a contact form email
func (es *EmailService) SendContactEmail(name, email, subject, message string) (string, error) {
	// Check if email configuration is valid
	if es.config.Domain == "" || es.config.APIKey == "" || es.config.FromEmail == "" || es.config.ToEmail == "" {
		return "", fmt.Errorf("email configuration is incomplete: domain=%s, from=%s, to=%s",
			es.config.Domain, es.config.FromEmail, es.config.ToEmail)
	}

	subjectLine := fmt.Sprintf("Contact Form: %s", subject)

	body := fmt.Sprintf(`
New contact form submission from Tokotoko:

Name: %s
Email: %s
Subject: %s

Message:
%s

---
This message was sent from the Tokotoko contact form.
`, name, email, subject, message)

	return es.sendEmail(subjectLine, body, email)
}

// SendFeedbackEmail sends a feedback form email
func (es *EmailService) SendFeedbackEmail(email, feedbackType, title, message, rating string) (string, error) {
	// Check if email configuration is valid
	if es.config.Domain == "" || es.config.APIKey == "" || es.config.FromEmail == "" || es.config.ToEmail == "" {
		return "", fmt.Errorf("email configuration is incomplete: domain=%s, from=%s, to=%s",
			es.config.Domain, es.config.FromEmail, es.config.ToEmail)
	}

	subjectLine := fmt.Sprintf("Feedback: %s", title)

	body := fmt.Sprintf(`
New feedback submission from Tokotoko:

Email: %s
Type: %s
Title: %s
Rating: %s

Feedback:
%s

---
This message was sent from the Tokotoko feedback form.
`, email, feedbackType, title, rating, message)

	return es.sendEmail(subjectLine, body, email)
}

// sendEmail is a helper method to send emails
func (es *EmailService) sendEmail(subject, body, userEmail string) (string, error) {
	// Create the message
	m := es.mg.NewMessage(
		fmt.Sprintf("%s <%s>", es.config.FromName, es.config.FromEmail),
		subject,
		body,
		es.config.ToEmail,
	)

	// Add user email as reply-to if provided
	if userEmail != "" {
		m.AddHeader("Reply-To", userEmail)
	}

	// Set timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	// Send the message
	_, id, err := es.mg.Send(ctx, m)
	if err != nil {
		return "", fmt.Errorf("failed to send email: %v", err)
	}

	return id, nil
}

// SendTestEmail sends a test email to verify configuration
func (es *EmailService) SendTestEmail() (string, error) {
	// Check if email configuration is valid
	if es.config.Domain == "" || es.config.APIKey == "" || es.config.FromEmail == "" || es.config.ToEmail == "" {
		return "", fmt.Errorf("email configuration is incomplete: domain=%s, from=%s, to=%s",
			es.config.Domain, es.config.FromEmail, es.config.ToEmail)
	}

	subject := "Test Email from Tokotoko"
	body := `
This is a test email from the Tokotoko server.

If you're receiving this, the email configuration is working correctly!

---
Tokotoko Email Service
`

	return es.sendEmail(subject, body, "")
}
