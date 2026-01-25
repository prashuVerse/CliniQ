package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/PrasadNaik1310/CliniQ/db"
	"github.com/PrasadNaik1310/CliniQ/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/xlzd/gotp"
	"golang.org/x/crypto/bcrypt"
)

/*func Register(c *gin.Context) {
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)

	// Save user
	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
}
*/

func PatientLogin(c *gin.Context) {
	var credentials struct {
		Phone string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Login attempt for Phone: %s", credentials.Phone)

	var patient models.User
	if err := db.DB.Where("phoneno = ?", credentials.Phone).First(&patient).Error; err != nil {
		log.Printf("User not found: %s", credentials.Phone)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Get JWT secret from environment
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Printf("JWT_SECRET not found in environment")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT secret not configured"})
		return
	}

	log.Printf("JWT_SECRET for token generation: %s", jwtSecret[:10]+"...")

	// Generate token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":    patient.ID,
		"patient_id": patient.PatientId,
		"exp":        time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		log.Printf("Failed to sign token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	log.Printf("Token generated successfully for user: %s (ID: %d)", credentials.Phone, patient.ID)

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"user_id":    patient.ID,
			"patient_id": patient.PatientId,
			"phone":      patient.Phoneno,
		},
	})
}

func DoctorLogin(c *gin.Context) {
	var credentials struct {
		DoctorId   string `json:"doctorid" binding:"required"`
		HospitalId string `json:"hospitalid" `
		Password   string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Login attempt for Doctor: %s from Hospital: %s", credentials.DoctorId, credentials.HospitalId)

	var doctor models.Doctor
	if err := db.DB.Where("doctorid = ? AND hospital_id = ?", credentials.DoctorId, credentials.HospitalId).First(&doctor).Error; err != nil {
		log.Printf("Doctor not found: %s", credentials.DoctorId)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(doctor.Password), []byte(credentials.Password)); err != nil {
		log.Printf("Password mismatch for doctor: %s", credentials.DoctorId)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Get JWT secret from environment
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Printf("JWT_SECRET not found in environment")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT secret not configured"})
		return
	}

	// Generate token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"doctor_id":   doctor.ID,
		"doctorid":    doctor.Doctorid,
		"doctor_name": doctor.DoctorName,
		"hospital_id": doctor.HospitalId,
		"exp":         time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		log.Printf("Failed to sign token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	log.Printf("Token generated successfully for doctor: %s", credentials.DoctorId)

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"doctor": gin.H{
			"doctor_id":   doctor.ID,
			"doctorid":    doctor.Doctorid,
			"doctor_name": doctor.DoctorName,
			"hospital_id": doctor.HospitalId,
		},
	})
}

func VerifyTotp(secret string, inputOtp string) bool {
	totp := gotp.NewDefaultTOTP(secret)
	//now := totp.Now()
	timeStamp := int64(time.Now().Unix())
	err := totp.Verify(inputOtp, timeStamp)
	if err == false {
		fmt.Println("Error verifying otp ,", err)
		return false
	}
	return true
}
