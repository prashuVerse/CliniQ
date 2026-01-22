package handlers

import (
	"net/http"

	"github.com/PrasadNaik1310/CliniQ/db"
	"github.com/PrasadNaik1310/CliniQ/models"
	"github.com/gin-gonic/gin"
)

func PatientRegister(c *gin.Context) {
	var Patient models.User

	if err := c.ShouldBindJSON(&Patient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	//hashedPassword, err := bcrypt.GenerateFromPassword([]byte(Patient.password),bcrypt.DefaultCost)

	if err := db.DB.Create(&Patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
}
