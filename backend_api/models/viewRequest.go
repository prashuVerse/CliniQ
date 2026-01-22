package models

import (
	"gorm.io/gorm"
)

type statusType string

const (
	Pending  statusType = "Pending"
	Accepted statusType = "Accepted"
	Rejected statusType = "Rejected"
)

type viewRequest struct {
	gorm.Model
	RequestId   string     `json:"requestid"`
	Requesterid string     `json:"requesterid"`
	Target_id   string     `json:"targetid"`
	Status      statusType `json:"status"`
}
