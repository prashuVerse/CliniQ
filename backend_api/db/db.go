package db

import (
	"log"
	"net/url"
	"os"
	"strings"
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

	// Add connection timeout if it's a URL format and not already present
	if strings.HasPrefix(dsn, "postgresql://") || strings.HasPrefix(dsn, "postgres://") {
		if !strings.Contains(dsn, "connect_timeout") {
			// Parse and add connect_timeout as query parameter
			if u, err := url.Parse(dsn); err == nil {
				q := u.Query()
				q.Set("connect_timeout", "10")
				u.RawQuery = q.Encode()
				dsn = u.String()
			}
		}
	} else if !strings.Contains(dsn, "connect_timeout") {
		// DSN format (key=value pairs)
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
	if err := DB.AutoMigrate(&models.Prescription{}); err != nil {
		log.Print("failed to Automigrate Prescriptions")
		return err
	}
	if err := DB.AutoMigrate(&models.TemporaryAccessToken{}); err != nil {
		log.Print("failed to Automigrate TemporaryAccessTokens")
		return err
	}
	log.Printf("user migrated")
	log.Printf("Doctor migrated")
	log.Printf("viewrequest migrated")
	log.Printf("accessrequest migrated")
	log.Printf("prescription migrated")
	log.Printf("temporary access token migrated")
	log.Printf("DB Chaluuuuuuuuuu")
	return nil
}
