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
	// Get database URL from environment variable
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fallback for local development
		dsn = "host=localhost user=postgres password=postgres dbname=cliniq port=5432 sslmode=disable"
		log.Print("DATABASE_URL not found, using default local connection")
	}

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Print("Failed to connect to database")
		return err
	}
	DB = database
	log.Print("Connected to database")

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
