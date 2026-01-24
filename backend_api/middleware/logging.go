package middleware

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// RequestLogging logs all incoming requests
func RequestLogging() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		// Log request
		log.Printf("[%s] %s %s from %s", c.Request.Method, c.Request.URL.Path, c.Request.Proto, c.ClientIP())

		c.Next()

		// Log response
		duration := time.Since(startTime)
		log.Printf("[%d] %s %s completed in %v", c.Writer.Status(), c.Request.Method, c.Request.URL.Path, duration)
	}
}

// ErrorHandler handles panics and recovers
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic recovered: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
				})
			}
		}()
		c.Next()

		// Check if there were any errors recorded
		if len(c.Errors) > 0 {
			lastError := c.Errors.Last()
			log.Printf("Handler error: %v", lastError)
		}
	}
}
