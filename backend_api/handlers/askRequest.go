package handlers

import (
	"log"
	"net/http"

	"github.com/PrasadNaik1310/CliniQ/db"
	"github.com/PrasadNaik1310/CliniQ/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AskRequest - Doctor requests consent from a patient
func AskRequest(c *gin.Context) {
	var req struct {
		DoctorId  string `json:"doctorid" binding:"required"`
		PatientId string `json:"patientid" binding:"required"`
		Reason    string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify doctor exists
	var doctor models.Doctor
	if err := db.DB.Where("doctorid = ?", req.DoctorId).First(&doctor).Error; err != nil {
		log.Printf("Doctor not found: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Doctor not found"})
		return
	}

	// Verify patient exists
	var patient models.User
	if err := db.DB.Where("patient_id = ?", req.PatientId).First(&patient).Error; err != nil {
		log.Printf("Patient not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	// Create new consent request
	viewRequest := models.ViewRequest{
		RequestId:   uuid.New().String(),
		Requesterid: req.DoctorId,
		Target_id:   req.PatientId,
		Status:      models.Pending,
	}

	if err := db.DB.Create(&viewRequest).Error; err != nil {
		log.Printf("Error creating consent request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create consent request"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Consent request sent successfully",
		"request_id": viewRequest.RequestId,
		"status":     viewRequest.Status,
	})
}
