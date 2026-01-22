package models

import (
	"time"

	"gorm.io/gorm"
)

type AcessGrant struct {
	gorm.Model
	AccessId  string    `json:"acessid"`
	ViewerId  string    `json:"viewerid"`
	OwnerId   string    `json:"ownerid"`
	Scope     string    `json:"scope"`
	ExpiresAt time.Time `json:"time"`
}
