package handlers

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"video-player-backend/internal/errors"
	"video-player-backend/internal/utils"
)

// VTTUploadHandler handles VTT file uploads
type VTTUploadHandler struct {
	uploadPath string
}

// NewVTTUploadHandler creates a new VTT upload handler
func NewVTTUploadHandler(uploadPath string) *VTTUploadHandler {
	// Ensure upload directory exists
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		log.Printf("Failed to create upload directory: %v", err)
	}

	return &VTTUploadHandler{
		uploadPath: uploadPath,
	}
}

// UploadVTT handles VTT file uploads
func (h *VTTUploadHandler) UploadVTT(w http.ResponseWriter, r *http.Request) {

	// Check if request is multipart/form-data
	if r.Header.Get("Content-Type") == "" || !strings.Contains(r.Header.Get("Content-Type"), "multipart/form-data") {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Parse multipart form with max memory of 32MB
	err := r.ParseMultipartForm(32 << 20) // 32MB
	if err != nil {
		log.Printf("Failed to parse multipart form: %v", err)
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Get the file from the form
	file, header, err := r.FormFile("vtt_file")
	if err != nil {
		log.Printf("Failed to get file from form: %v", err)
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}
	defer file.Close()

	// Validate file
	if err := h.validateVTTFile(header.Filename, header.Size); err != nil {
		errors.WriteErrorResponse(w, err)
		return
	}

	// Generate unique filename
	filename := h.generateUniqueFilename(header.Filename)
	filePath := filepath.Join(h.uploadPath, filename)

	// Create the file on disk
	dst, err := os.Create(filePath)
	if err != nil {
		log.Printf("Failed to create file: %v", err)
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}
	defer dst.Close()

	// Copy the uploaded file to the destination
	_, err = io.Copy(dst, file)
	if err != nil {
		log.Printf("Failed to copy file: %v", err)
		// Clean up the created file
		os.Remove(filePath)
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	// Return success response with file info
	response := map[string]interface{}{
		"message":       "VTT file uploaded successfully",
		"filename":      filename,
		"original_name": header.Filename,
		"size":          header.Size,
		"uploaded_at":   time.Now().UTC(),
		"url":           fmt.Sprintf("/api/v1/uploads/vtt/%s", filename),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	// Write JSON response
	if err := utils.WriteJSONResponse(w, response); err != nil {
		log.Printf("Failed to write JSON response: %v", err)
	}
}

// validateVTTFile validates the uploaded VTT file
func (h *VTTUploadHandler) validateVTTFile(filename string, size int64) error {
	// Check file extension
	ext := strings.ToLower(filepath.Ext(filename))
	if ext != ".vtt" {
		return errors.NewAPIError("INVALID_FILE_TYPE", "Invalid file type. Only .vtt files are allowed.")
	}

	// Check file size (max 10MB)
	maxSize := int64(10 << 20) // 10MB
	if size > maxSize {
		return errors.NewAPIError("FILE_TOO_LARGE", "File too large. Maximum size is 10MB.")
	}

	// Check if filename is empty
	if strings.TrimSpace(filename) == "" {
		return errors.NewAPIError("INVALID_FILENAME", "Filename cannot be empty.")
	}

	// Check for dangerous characters in filename
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		return errors.NewAPIError("INVALID_FILENAME", "Invalid filename. Contains dangerous characters.")
	}

	return nil
}

// generateUniqueFilename generates a unique filename to prevent conflicts
func (h *VTTUploadHandler) generateUniqueFilename(originalFilename string) string {
	// Get file extension
	ext := filepath.Ext(originalFilename)

	// Get base name without extension
	baseName := strings.TrimSuffix(originalFilename, ext)

	// Sanitize base name (remove spaces and special characters)
	baseName = strings.ReplaceAll(baseName, " ", "_")
	baseName = strings.ReplaceAll(baseName, "-", "_")

	// Generate timestamp
	timestamp := time.Now().Format("20060102_150405")

	// Create unique filename
	uniqueFilename := fmt.Sprintf("%s_%s%s", baseName, timestamp, ext)

	return uniqueFilename
}

// GetVTTFile serves VTT files
func (h *VTTUploadHandler) GetVTTFile(w http.ResponseWriter, r *http.Request) {
	// Get filename from URL path
	filename := strings.TrimPrefix(r.URL.Path, "/api/v1/uploads/vtt/")

	// Validate filename
	if filename == "" || strings.Contains(filename, "..") {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Construct file path
	filePath := filepath.Join(h.uploadPath, filename)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		errors.WriteErrorResponse(w, errors.NewAPIError("VTT_FILE_NOT_FOUND", "VTT file not found"))
		return
	}

	// Set appropriate headers
	w.Header().Set("Content-Type", "text/vtt; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=3600") // Cache for 1 hour

	// Serve the file
	http.ServeFile(w, r, filePath)
}

// ListVTTFiles lists all uploaded VTT files
func (h *VTTUploadHandler) ListVTTFiles(w http.ResponseWriter, r *http.Request) {

	// Read directory
	files, err := os.ReadDir(h.uploadPath)
	if err != nil {
		log.Printf("Failed to read upload directory: %v", err)
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	var vttFiles []map[string]interface{}
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(strings.ToLower(file.Name()), ".vtt") {
			info, err := file.Info()
			if err != nil {
				continue
			}

			vttFiles = append(vttFiles, map[string]interface{}{
				"filename":    file.Name(),
				"size":        info.Size(),
				"modified_at": info.ModTime().UTC(),
				"url":         fmt.Sprintf("/api/v1/uploads/vtt/%s", file.Name()),
			})
		}
	}

	response := map[string]interface{}{
		"data":  vttFiles,
		"count": len(vttFiles),
	}

	w.Header().Set("Content-Type", "application/json")
	if err := utils.WriteJSONResponse(w, response); err != nil {
		log.Printf("Failed to write JSON response: %v", err)
	}
}

// DeleteVTTFile deletes a VTT file
func (h *VTTUploadHandler) DeleteVTTFile(w http.ResponseWriter, r *http.Request) {

	// Get filename from query parameter
	filename := r.URL.Query().Get("filename")
	if filename == "" {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Validate filename
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		errors.WriteErrorResponse(w, errors.ErrInvalidRequest)
		return
	}

	// Construct file path
	filePath := filepath.Join(h.uploadPath, filename)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		errors.WriteErrorResponse(w, errors.NewAPIError("VTT_FILE_NOT_FOUND", "VTT file not found"))
		return
	}

	// Delete the file
	if err := os.Remove(filePath); err != nil {
		log.Printf("Failed to delete file: %v", err)
		errors.WriteErrorResponse(w, errors.WrapError(err, errors.ErrDatabase))
		return
	}

	response := map[string]interface{}{
		"message":  "VTT file deleted successfully",
		"filename": filename,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := utils.WriteJSONResponse(w, response); err != nil {
		log.Printf("Failed to write JSON response: %v", err)
	}
}
