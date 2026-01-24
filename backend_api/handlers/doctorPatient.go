package handlers

import (
	"log"
	"net/http"

	"github.com/PrasadNaik1310/CliniQ/db"
	"github.com/PrasadNaik1310/CliniQ/models"
	"github.com/gin-gonic/gin"
)

// GetPatientDataForDoctor retrieves patient data by patient ID for doctor access
func GetPatientDataForDoctor(c *gin.Context) {
	patientID := c.Param("id")

	if patientID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Patient ID is required"})
		return
	}

	log.Printf("Doctor requesting patient data for: %s", patientID)

	var patient models.User
	if err := db.DB.Where("id = ?", patientID).First(&patient).Error; err != nil {
		log.Printf("Patient not found: %s", patientID)
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	// Return patient data in a structured format
	patientData := gin.H{
		"name":              patient.UserName,
		"id":                patient.ID,
		"blood_type":        "Unknown",  // Not stored in User model
		"allergies":         []string{}, // Not stored in User model
		"conditions":        []string{}, // Not stored in User model
		"email":             "Unknown",  // Not stored in User model
		"phone":             patient.Phoneno,
		"abha_id":           patient.AbhaId,
		"address":           "Unknown", // Not stored in User model
		"emergency_contact": "Unknown", // Not stored in User model
		"patient_id":        patient.PatientId,
		"aadhar":            patient.Aadhar,
		"recent_visit":      "Unknown", // This can be fetched from visit history if available
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    patientData,
	})
}

// GetPatientByQRToken retrieves patient data using a scanned QR token
func GetPatientByQRToken(c *gin.Context) {
	token := c.Query("token")

	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	log.Printf("Doctor scanning QR token: %s", token)

	var accessToken models.TemporaryAccessToken
	if err := db.DB.Where("token = ?", token).First(&accessToken).Error; err != nil {
		log.Printf("Invalid QR token: %s", token)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return
	}

	// Verify token is still valid
	if !accessToken.IsValid() {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token has expired"})
		return
	}

	// Get patient data
	var patient models.User
	if err := db.DB.Where("id = ?", accessToken.PatientID).First(&patient).Error; err != nil {
		log.Printf("Patient not found for token")
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	// Update token to mark as used
	accessToken.IsUsed = true
	db.DB.Save(&accessToken)

	patientData := gin.H{
		"name":              patient.UserName,
		"id":                patient.ID,
		"blood_type":        "Unknown",  // Not stored in User model
		"allergies":         []string{}, // Not stored in User model
		"conditions":        []string{}, // Not stored in User model
		"email":             "Unknown",  // Not stored in User model
		"phone":             patient.Phoneno,
		"abha_id":           patient.AbhaId,
		"address":           "Unknown", // Not stored in User model
		"emergency_contact": "Unknown", // Not stored in User model
		"patient_id":        patient.PatientId,
		"aadhar":            patient.Aadhar,
		"access_level":      accessToken.AccessLevel,
		"expires_at":        accessToken.ExpiresAt,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    patientData,
		"token_info": gin.H{
			"access_level":   accessToken.AccessLevel,
			"remaining_time": accessToken.GetRemainingTime(),
		},
	})
}
