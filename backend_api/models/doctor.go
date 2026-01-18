package models

import (
	"gorm.io/gorm"
)

type doctor struct {
	gorm.Model
	Doctorid   string `json:"doctorid"`
	DoctorName string `json:"doctorname"`
	PatientId  string `json:"patientid"`
}
