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
		//	Username string `json:"username"`
		AbhaId string `json:"abhaid"`
	}

	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Login attempt for AbhaId: %s", credentials.AbhaId)

	var patient models.User
	if err := db.DB.Where("abha_id = ?", credentials.AbhaId).First(&patient).Error; err != nil {
		log.Printf("User not found: %s", credentials.AbhaId)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	/*	if err := bcrypt.CompareHashAndPassword([]byte(patient.Password), []byte(credentials.Password)); err != nil {
			log.Printf("Password mismatch for user: %s", credentials.Email)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
	*/ // No passwords for patients , commenting for use of doctor login .
	//using otp generation .
	// using gotp , totp
	secret := gotp.RandomSecret(16)
	fmt.Println("random secret :", secret)

	totp := gotp.NewDefaultTOTP(secret)

	currentOtp := totp.Now()

	fmt.Println("current otp :-> ", currentOtp)
	VerifyTotp(secret, "12345") // testinggggggggg , change in prod.

	// Get JWT secret from environment - SAME as middleware
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Printf("JWT_SECRET not found in environment")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT secret not configured"})
		return
	}

	log.Printf("JWT_SECRET for token generation: %s", jwtSecret[:10]+"...")

	// Generate token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": patient.ID,
		"abhaId":  patient.AbhaId,

		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		log.Printf("Failed to sign token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	log.Printf("Token generated successfully for user: %s", credentials.AbhaId)

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"user_id": patient.ID,
			"abhaId":  patient.AbhaId,
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
