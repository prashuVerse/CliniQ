package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/PrasadNaik1310/CliniQ/db"
	"github.com/PrasadNaik1310/CliniQ/handlers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Print(err)
	} //useful in prod
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") //change this in prod
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE,UPDATE,OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})
	err := db.DbInit()
	if err != nil {
		log.Fatal(err)
		log.Println("Stopped execution")
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"service": "CliniQ",
			"status":  "healthy",
		})
	})

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/patient", handlers.PatientLogin)
			auth.POST("/doctor", handlers.DoctorLogin)
		}
		viewAccess := api.Group("/consent")
		{
			viewAccess.GET("/viewRequest", handlers.ViewRequest)
			viewAccess.POST("/askRequest", handlers.AskRequest)
			viewAccess.POST("/acceptRequest", handlers.AcceptRequest)
			viewAccess.POST("/rejectRequest", handlers.RejectRequest)
		}

		go func() {
			srv := &http.Server{
				Addr:    ":" + "8080",
				Handler: r,
			}
			if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
				log.Fatalf("failed to run server: %v", err)
			}

		}()
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit
		fmt.Println("Signal recieved for shutdown. ")
	}
}
