package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"image/png"
	"net/http"
	"strconv"
	"time"

	"github.com/PrasadNaik1310/CliniQ/db"
	"github.com/PrasadNaik1310/CliniQ/models"
	"github.com/gin-gonic/gin"
	"github.com/skip2/go-qrcode"
)

// GenerateQRCode generates a temporary access QR code for doctors
func GenerateQRCode(c *gin.Context) {
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

	// Get request parameters
	var req struct {
		DurationMinutes int    `json:"duration_minutes" binding:"required,min=1,max=1440"` // 1 minute to 24 hours
		AccessLevel     string `json:"access_level" binding:"required,oneof=BASIC FULL"`   // BASIC or FULL access
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: duration_minutes (1-1440) and access_level (BASIC/FULL) required"})
		return
	}

	// Generate unique token
	token := generateRandomToken(32)

	// Create QR code data
	qrData := fmt.Sprintf("cliniq://access/%s", token)

	// Generate QR code image
	qr, err := qrcode.New(qrData, qrcode.Medium)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate QR code"})
		return
	}

	// Convert QR code to base64 PNG
	qrBase64 := encodeQRCodeToBase64(qr)

	// Set expiration time
	expiresAt := time.Now().Add(time.Duration(req.DurationMinutes) * time.Minute)

	// Create database record
	accessToken := models.TemporaryAccessToken{
		PatientID:   uint(uid),
		Token:       token,
		QRCode:      qrBase64,
		ExpiresAt:   expiresAt,
		IsUsed:      false,
		AccessLevel: req.AccessLevel,
	}

	if err := db.DB.Create(&accessToken).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create access token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":       "QR code generated successfully",
		"token":         token,
		"qr_code":       qrBase64,
		"expires_at":    expiresAt.Format("2006-01-02 15:04:05"),
		"access_level":  req.AccessLevel,
		"duration_mins": req.DurationMinutes,
	})
}

// ScanQRCode validates a scanned QR token and grants access
func ScanQRCode(c *gin.Context) {
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

	// Get token from request
	var req struct {
		Token string `json:"token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token required"})
		return
	}

	// Find the token in database
	var accessToken models.TemporaryAccessToken
	if err := db.DB.Where("token = ?", req.Token).First(&accessToken).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid or expired token"})
		return
	}

	// Check if token is valid
	if !accessToken.IsValid() {
		c.JSON(http.StatusForbidden, gin.H{"error": "Token has expired or already been used"})
		return
	}

	// Check if doctor is trying to scan
	var doctor models.Doctor
	if err := db.DB.Where("user_id = ?", uid).First(&doctor).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only doctors can scan QR codes"})
		return
	}

	// Mark token as used
	now := time.Now()
	if err := db.DB.Model(&accessToken).Updates(map[string]interface{}{
		"is_used":   true,
		"used_at":   now,
		"doctor_id": uid,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update access token"})
		return
	}

	// Get patient information
	var patient models.User
	if err := db.DB.Where("id = ?", accessToken.PatientID).First(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Patient not found"})
		return
	}

	// Create a temporary access grant using correct field names
	grant := models.AcessGrant{
		AccessId:  accessToken.Token,
		ViewerId:  fmt.Sprintf("%d", uid),                   // Doctor ID
		OwnerId:   fmt.Sprintf("%d", accessToken.PatientID), // Patient ID
		Scope:     accessToken.AccessLevel,
		ExpiresAt: accessToken.ExpiresAt,
	}

	if err := db.DB.Create(&grant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to grant access"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Access granted successfully",
		"patient_id":   accessToken.PatientID,
		"patient_name": patient.UserName,
		"access_level": accessToken.AccessLevel,
		"expires_at":   accessToken.ExpiresAt.Format("2006-01-02 15:04:05"),
	})
}

// GetMyAccessTokens retrieves all QR tokens for current patient
func GetMyAccessTokens(c *gin.Context) {
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

	var tokens []models.TemporaryAccessToken
	if err := db.DB.Where("patient_id = ?", uint(uid)).
		Preload("Doctor").
		Order("created_at DESC").
		Find(&tokens).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tokens"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tokens": tokens,
		"total":  len(tokens),
	})
}

// RevokeAccessToken revokes an unused QR token
func RevokeAccessToken(c *gin.Context) {
	userID := c.GetString("user_id")
	tokenID := c.Param("id")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	uid, err := strconv.ParseUint(userID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Find and verify ownership
	var accessToken models.TemporaryAccessToken
	if err := db.DB.Where("id = ? AND patient_id = ?", tokenID, uint(uid)).First(&accessToken).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Token not found"})
		return
	}

	// Delete token
	if err := db.DB.Delete(&accessToken).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to revoke token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Token revoked successfully"})
}

// Helper functions

// generateRandomToken generates a cryptographically secure random token
func generateRandomToken(length int) string {
	token := make([]byte, length)
	if _, err := rand.Read(token); err != nil {
		// Fallback to timestamp-based token
		return hex.EncodeToString([]byte(fmt.Sprintf("%d", time.Now().UnixNano())))
	}
	return hex.EncodeToString(token)
}

// encodeQRCodeToBase64 converts QR code to base64 PNG
func encodeQRCodeToBase64(qr *qrcode.QRCode) string {
	// Get the image from QR code
	img := qr.Image(256)

	// Encode image to PNG in memory
	buf := new(bytes.Buffer)
	err := png.Encode(buf, img)
	if err != nil {
		// Fallback: return placeholder
		return "data:image/png;base64," + base64.StdEncoding.EncodeToString([]byte("qr-placeholder"))
	}

	// Convert to base64 with data URI prefix
	encoded := base64.StdEncoding.EncodeToString(buf.Bytes())
	return "data:image/png;base64," + encoded
}
