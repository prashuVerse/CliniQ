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
	"github.com/PrasadNaik1310/CliniQ/middleware"
	"github.com/PrasadNaik1310/CliniQ/seeds"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Print(err)
	} //useful in prod
	r := gin.Default()

	// Apply global middleware
	r.Use(middleware.ErrorHandler())
	r.Use(middleware.RequestLogging())

	// CORS middleware
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

	// Seed database with test data
	seeds.SeedDatabase()

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

		// Protected consent endpoints
		consent := api.Group("/consent")
		consent.Use(middleware.AuthMiddleware())
		{
			// Patient endpoints
			patientEndpoints := consent.Group("")
			patientEndpoints.Use(middleware.PatientOnly())
			{
				patientEndpoints.GET("/viewRequest", handlers.ViewRequest)
				patientEndpoints.POST("/acceptRequest", handlers.AcceptRequest)
				patientEndpoints.POST("/rejectRequest", handlers.RejectRequest)
			}

			// Doctor endpoints
			doctorEndpoints := consent.Group("")
			doctorEndpoints.Use(middleware.DoctorOnly())
			{
				doctorEndpoints.POST("/askRequest", handlers.AskRequest)
			}
		}

		// Protected prescription endpoints
		prescription := api.Group("/prescription")
		prescription.Use(middleware.AuthMiddleware())
		{
			prescription.POST("/upload", handlers.UploadPrescription)
			prescription.GET("/list", handlers.GetPrescriptions)
			prescription.DELETE("/:id", handlers.DeletePrescription)
			prescription.GET("/download/:id", handlers.DownloadPrescription)
		}

		// Protected AI analysis endpoints
		ai := api.Group("/ai")
		ai.Use(middleware.AuthMiddleware())
		{
			ai.POST("/analyze", handlers.AnalyzePrescriptions)
		}

		// Protected QR code endpoints
		qr := api.Group("/qr")
		qr.Use(middleware.AuthMiddleware())
		{
			qr.POST("/generate", handlers.GenerateQRCode)
			qr.POST("/scan", handlers.ScanQRCode)
			qr.GET("/my-tokens", handlers.GetMyAccessTokens)
			qr.DELETE("/:id", handlers.RevokeAccessToken)
		}

		// Doctor patient data endpoints
		doctor := api.Group("/doctor")
		doctor.Use(middleware.AuthMiddleware())
		doctor.Use(middleware.DoctorOnly())
		{
			doctor.GET("/patient/:id", handlers.GetPatientDataForDoctor)
			doctor.GET("/patient-by-qr", handlers.GetPatientByQRToken)
		}

		// Read PORT from environment or default to 8080
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}

		go func() {
			srv := &http.Server{
				Addr:    ":" + port,
				Handler: r,
			}
			log.Printf("Starting server on port %s", port)
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
