package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/PrasadNaik1310/CliniQ/db"
	"github.com/PrasadNaik1310/CliniQ/models"
	"github.com/gin-gonic/gin"
)

const (
	MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
	UPLOAD_DIR    = "./uploads"
	ALLOWED_PDF   = "application/pdf"
	ALLOWED_TEXT  = "text/plain"
)

// UploadPrescription handles prescription file uploads
func UploadPrescription(c *gin.Context) {
	// Get user ID from context (set by middleware)
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Convert userID string to uint
	uid, err := strconv.ParseUint(userID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get file from request
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file provided"})
		return
	}

	// Validate file size
	if file.Size > MAX_FILE_SIZE {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 10MB limit"})
		return
	}

	// Get file extension and validate type
	fileExt := strings.ToLower(filepath.Ext(file.Filename))
	var fileType string

	switch fileExt {
	case ".pdf":
		fileType = "pdf"
	case ".txt":
		fileType = "txt"
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only PDF and TXT files are allowed"})
		return
	}

	// Create uploads directory if it doesn't exist
	if err := os.MkdirAll(UPLOAD_DIR, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Generate unique filename
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%d_%s", uid, timestamp, file.Filename)
	filepath := filepath.Join(UPLOAD_DIR, filename)

	// Save file
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Get optional description from form
	description := c.PostForm("description")

	// Create prescription record in database
	prescription := models.Prescription{
		UserID:      uint(uid),
		FileName:    file.Filename,
		FilePath:    filepath,
		FileType:    fileType,
		FileSize:    file.Size,
		UploadDate:  time.Now().Format("2006-01-02 15:04:05"),
		Description: description,
	}

	if err := db.DB.Create(&prescription).Error; err != nil {
		// Clean up file if database save fails
		os.Remove(filepath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save prescription record"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":         "Prescription uploaded successfully",
		"prescription_id": prescription.ID,
		"file_name":       prescription.FileName,
		"file_type":       prescription.FileType,
		"upload_date":     prescription.UploadDate,
	})
}

// GetPrescriptions retrieves all prescriptions for a user
func GetPrescriptions(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	uid, err := strconv.ParseUint(userID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var prescriptions []models.Prescription
	if err := db.DB.Where("user_id = ?", uint(uid)).Find(&prescriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve prescriptions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"prescriptions": prescriptions,
		"total":         len(prescriptions),
	})
}

// DeletePrescription deletes a prescription by ID
func DeletePrescription(c *gin.Context) {
	userID := c.GetString("user_id")
	prescriptionID := c.Param("id")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var prescription models.Prescription
	if err := db.DB.Where("id = ? AND user_id = ?", prescriptionID, userID).First(&prescription).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}

	// Delete file from storage
	if err := os.Remove(prescription.FilePath); err != nil {
		// Log error but continue with database deletion
		fmt.Printf("Warning: Failed to delete file %s: %v\n", prescription.FilePath, err)
	}

	// Delete from database
	if err := db.DB.Delete(&prescription).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete prescription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prescription deleted successfully"})
}

// DownloadPrescription downloads a prescription file
func DownloadPrescription(c *gin.Context) {
	userID := c.GetString("user_id")
	prescriptionID := c.Param("id")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var prescription models.Prescription
	if err := db.DB.Where("id = ? AND user_id = ?", prescriptionID, userID).First(&prescription).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}

	// Set appropriate content type
	contentType := "application/octet-stream"
	if prescription.FileType == "pdf" {
		contentType = ALLOWED_PDF
	} else if prescription.FileType == "txt" {
		contentType = ALLOWED_TEXT
	}

	c.Header("Content-Type", contentType)
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", prescription.FileName))
	c.File(prescription.FilePath)
}
