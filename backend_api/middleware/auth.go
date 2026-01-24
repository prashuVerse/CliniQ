package middleware

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware validates JWT tokens
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			log.Printf("Missing authorization header from %s", c.ClientIP())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("Invalid authorization header format from %s", c.ClientIP())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Get JWT secret from environment
		jwtSecret := os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			log.Printf("JWT_SECRET not configured")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error"})
			c.Abort()
			return
		}

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			log.Printf("Invalid token from %s: %v", c.ClientIP(), err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Printf("Invalid token claims from %s", c.ClientIP())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Store claims in context for downstream handlers
		c.Set("claims", claims)
		c.Set("user_id", claims["user_id"])
		c.Set("doctor_id", claims["doctor_id"])
		c.Set("abhaId", claims["abhaId"])
		c.Set("doctorid", claims["doctorid"])

		c.Next()
	}
}

// PatientOnly restricts access to patients only
func PatientOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, exists := c.Get("claims")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		mapClaims := claims.(jwt.MapClaims)
		// Check if it's a patient token (has abhaId field)
		if _, ok := mapClaims["abhaId"]; !ok {
			log.Printf("Non-patient attempting to access patient route from %s", c.ClientIP())
			c.JSON(http.StatusForbidden, gin.H{"error": "Only patients can access this endpoint"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// DoctorOnly restricts access to doctors only
func DoctorOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, exists := c.Get("claims")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		mapClaims := claims.(jwt.MapClaims)
		// Check if it's a doctor token (has doctorid field)
		if _, ok := mapClaims["doctorid"]; !ok {
			log.Printf("Non-doctor attempting to access doctor route from %s", c.ClientIP())
			c.JSON(http.StatusForbidden, gin.H{"error": "Only doctors can access this endpoint"})
			c.Abort()
			return
		}

		c.Next()
	}
}
