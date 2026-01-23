package handlers

import (
	"log"

	"github.com/gin-gonic/gin"
)

func ViewRequest(c *gin.Context) {
	log.Println("Hit ViewRequest!!")
}
