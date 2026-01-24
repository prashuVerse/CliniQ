package db

import (
	"log"
	"os"
	"time"

	"github.com/PrasadNaik1310/CliniQ/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func DbInit() error {
	// Get database URL from environment variable (REQUIRED)
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("ERROR: DATABASE_URL environment variable is not set. Cannot proceed without database connection.")
		return nil // Never reached, but satisfies return type
	}

	// Set connection timeout and SSL mode if not already in URL
	if !contains(dsn, "connect_timeout") {
		dsn += " connect_timeout=10"
	}

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
		return err
	}
	DB = database
	log.Print("Connected to database successfully")

	//configure connection pool
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	sqlDB.SetMaxOpenConns(200)
	sqlDB.SetMaxIdleConns(102)
	sqlDB.SetConnMaxIdleTime(10 * time.Minute)

	//auto-migrate
	if err := DB.AutoMigrate(&models.User{}); err != nil {
		log.Print("Failed to AtuoMigrate Users")
		return err
	}
	if err := DB.AutoMigrate(&models.Doctor{}); err != nil {
		log.Print("failed to Automigrate Doctors")
		return err
	}
	if err := DB.AutoMigrate(&models.AcessGrant{}); err != nil {
		log.Print("failed to Automigrate Doctors")
		return err
	}
	if err := DB.AutoMigrate(&models.ViewRequest{}); err != nil {
		log.Print("failed to Automigrate Doctors")
		return err
	}
	log.Printf("user migrated")
	log.Printf("Doctor migrated")
	log.Printf("viewrequest migrated")
	log.Printf("accessrequest migrated")
	log.Printf("DB Chaluuuuuuuuuu")
	return nil
}

// Helper function to check if string contains substring
func contains(s, substr string) bool {
	return len(s) > 0 && len(substr) > 0 && (s == substr || len(s) > len(substr) && (s[:len(substr)] == substr || s[len(s)-len(substr):] == substr || findSubstring(s, substr)))
}

func findSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
