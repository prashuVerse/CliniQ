package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthMiddleWare() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			log.Println("Auth header not found")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Auth header not found"})
			c.Abort()
			return
		}

	}
}
