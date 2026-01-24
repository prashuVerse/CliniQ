package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/PrasadNaik1310/CliniQ/db"
	"github.com/PrasadNaik1310/CliniQ/models"
	"github.com/gin-gonic/gin"
)

// ViewRequest - Patient views all pending consent requests
func ViewRequest(c *gin.Context) {
	patientId := c.Query("patientid")

	if patientId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "patientid is required"})
		return
	}

	var requests []models.ViewRequest
	if err := db.DB.Where("target_id = ?", patientId).Find(&requests).Error; err != nil {
		log.Printf("Error fetching requests: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"requests": requests,
		"count":    len(requests),
	})
}

// AcceptRequest - Patient accepts a consent request
func AcceptRequest(c *gin.Context) {
	var req struct {
		RequestId string `json:"requestid" binding:"required"`
		PatientId string `json:"patientid" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var viewRequest models.ViewRequest
	if err := db.DB.Where("request_id = ? AND target_id = ?", req.RequestId, req.PatientId).First(&viewRequest).Error; err != nil {
		log.Printf("Request not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Consent request not found"})
		return
	}

	// Update status to Accepted
	now := time.Now()
	if err := db.DB.Model(&viewRequest).Updates(map[string]interface{}{
		"status":      models.Accepted,
		"accepted_at": now,
	}).Error; err != nil {
		log.Printf("Error updating request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept request"})
		return
	}

	// Create access grant for the doctor
	accessGrant := models.AcessGrant{
		AccessId: viewRequest.RequestId,
		ViewerId: viewRequest.Requesterid,
		OwnerId:  viewRequest.Target_id,
		Scope:    "medical_records",
	}

	if err := db.DB.Create(&accessGrant).Error; err != nil {
		log.Printf("Error creating access grant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to grant access"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Consent accepted successfully"})
}

// RejectRequest - Patient rejects a consent request
func RejectRequest(c *gin.Context) {
	var req struct {
		RequestId string `json:"requestid" binding:"required"`
		PatientId string `json:"patientid" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var viewRequest models.ViewRequest
	if err := db.DB.Where("request_id = ? AND target_id = ?", req.RequestId, req.PatientId).First(&viewRequest).Error; err != nil {
		log.Printf("Request not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Consent request not found"})
		return
	}

	// Update status to Rejected
	now := time.Now()
	if err := db.DB.Model(&viewRequest).Updates(map[string]interface{}{
		"status":      models.Rejected,
		"rejected_at": now,
	}).Error; err != nil {
		log.Printf("Error updating request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Consent rejected successfully"})
}
