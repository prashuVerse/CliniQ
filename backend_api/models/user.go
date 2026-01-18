package models

import (
	"gorm.io/gorm"
)

type user struct {
	gorm.Model
	UserName     string `json:"username"`
	AbhaId       string `json:"abhaid"`
	Candoctorsee bool   `json:"candoctorsee"`
	Aadhar       string `json:"aadhar"`
	Phoneno      string `json:"phone"`
	PatientId    string `json:"patientid"`
}
