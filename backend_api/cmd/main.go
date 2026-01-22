package main

import (
	"log"

	"github.com/PrasadNaik1310/CliniQ/db"
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
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"service": "CliniQ",
			"status":  "healthy",
		})
	})
	go func() {
		err := db.DbInit()
		if err != nil {
			log.Fatal(err)
			log.Println("Stopped execution")
		}
	}() //gorountine for db init

}
