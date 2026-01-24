package models

import (
	"gorm.io/gorm"
)

type Doctor struct {
	gorm.Model
	Doctorid   string `json:"doctorid" gorm:"index:idx_doctor_hospital,unique"`
	DoctorName string `json:"doctorname"`
	HospitalId string `json:"hospitalid" gorm:"index:idx_doctor_hospital,unique"`
	Password   string `json:"password"`
	PatientId  string `json:"patientid"`
}
