package db

import (
	"log"
	"time"

	"github.com/PrasadNaik1310/CliniQ/models"
	_ "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func DbInit() error {
	dsn := "root:password@tcp(127.0.0.1:3306)/Cliniq?charset=utf8mb4&parseTime=True&loc=Local" //CHANGE IN PROD
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
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
