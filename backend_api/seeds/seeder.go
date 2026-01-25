package seeds

import (
	"fmt"
	"log"
	"time"

	"github.com/PrasadNaik1310/CliniQ/db"
	"github.com/PrasadNaik1310/CliniQ/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// SeedDatabase populates the database with test data
func SeedDatabase() {
	// Seed Patients
	seedPatients()

	// Seed Doctors
	seedDoctors()

	// Seed Prescriptions
	seedPrescriptions()

	fmt.Println("✅ Database seeded successfully!")
}

func seedPatients() {
	patients := []models.User{
		{
			UserName:     "Rahul Deshmukh",
			PatientId:    "PAT-001",
			AbhaId:       "rahul.deshmukh@abha",
			Phoneno:      "9876543210",
			Aadhar:       "123456789012",
			Candoctorsee: false,
		},
		{
			UserName:     "Priya Sharma",
			PatientId:    "PAT-002",
			AbhaId:       "priya.sharma@abha",
			Phoneno:      "9123456789",
			Aadhar:       "234567890123",
			Candoctorsee: false,
		},
		{
			UserName:     "Amit Kumar",
			PatientId:    "PAT-003",
			AbhaId:       "amit.kumar@abha",
			Phoneno:      "8765432109",
			Aadhar:       "345678901234",
			Candoctorsee: true,
		},
		{
			UserName:     "Sneha Patel",
			PatientId:    "PAT-004",
			AbhaId:       "sneha.patel@abha",
			Phoneno:      "9234567890",
			Aadhar:       "456789012345",
			Candoctorsee: false,
		},
		{
			UserName:     "Vikram Singh",
			PatientId:    "PAT-005",
			AbhaId:       "vikram.singh@abha",
			Phoneno:      "8234567890",
			Aadhar:       "567890123456",
			Candoctorsee: true,
		},
	}

	for _, patient := range patients {
		// Check if patient already exists
		var existing models.User
		if err := db.DB.Where("patient_id = ?", patient.PatientId).First(&existing).Error; err == gorm.ErrRecordNotFound {
			if err := db.DB.Create(&patient).Error; err != nil {
				log.Printf("❌ Error creating patient %s: %v", patient.UserName, err)
			} else {
				log.Printf("✅ Created patient: %s (ID: %s)", patient.UserName, patient.PatientId)
			}
		} else {
			// Always update existing patient with correct plain phone format
			db.DB.Model(&existing).Updates(models.User{
				Phoneno: patient.Phoneno,
				Aadhar:  patient.Aadhar,
				AbhaId:  patient.AbhaId,
			})
			log.Printf("🔄 Updated patient: %s (Phone: %s)", patient.UserName, patient.Phoneno)
		}
	}
}

func seedDoctors() {
	// Seed test doctors with hashed passwords
	// Password for all test doctors: "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	doctors := []models.Doctor{
		{
			Doctorid:   "DOC-001",
			DoctorName: "Dr. Arun Verma",
			HospitalId: "HOSP-001",
			Password:   string(hashedPassword),
		},
		{
			Doctorid:   "DOC-002",
			DoctorName: "Dr. Priya Gupta",
			HospitalId: "HOSP-001",
			Password:   string(hashedPassword),
		},
		{
			Doctorid:   "DOC-003",
			DoctorName: "Dr. Rajesh Rao",
			HospitalId: "HOSP-002",
			Password:   string(hashedPassword),
		},
		{
			Doctorid:   "DOC-004",
			DoctorName: "Dr. Meera Singh",
			HospitalId: "HOSP-002",
			Password:   string(hashedPassword),
		},
		{
			Doctorid:   "DOC-005",
			DoctorName: "Dr. Vikram Patel",
			HospitalId: "HOSP-001",
			Password:   string(hashedPassword),
		},
	}

	for _, doctor := range doctors {
		// Check if doctor already exists
		var existing models.Doctor
		if err := db.DB.Where("doctorid = ?", doctor.Doctorid).First(&existing).Error; err == gorm.ErrRecordNotFound {
			if err := db.DB.Create(&doctor).Error; err != nil {
				log.Printf("❌ Error creating doctor %s: %v", doctor.DoctorName, err)
			} else {
				log.Printf("✅ Created doctor: %s (ID: %s, Hospital: %s)", doctor.DoctorName, doctor.Doctorid, doctor.HospitalId)
			}
		} else {
			log.Printf("⏭️ Doctor already exists: %s", doctor.DoctorName)
		}
	}
}

func seedPrescriptions() {
	// Seed sample prescriptions for patients
	prescriptions := []models.Prescription{
		{
			UserID:      1, // Assuming first patient has ID 1
			FileName:    "prescription_jan_2026.pdf",
			FilePath:    "/prescriptions/prescription_jan_2026.pdf",
			FileType:    "pdf",
			FileSize:    256000,
			UploadDate:  time.Now().Add(-7 * 24 * time.Hour).Format("2006-01-02 15:04:05"),
			Description: "Monthly prescription for diabetes management",
		},
		{
			UserID:      2,
			FileName:    "blood_test_results.txt",
			FilePath:    "/prescriptions/blood_test_results.txt",
			FileType:    "txt",
			FileSize:    5120,
			UploadDate:  time.Now().Add(-3 * 24 * time.Hour).Format("2006-01-02 15:04:05"),
			Description: "Recent blood test results",
		},
		{
			UserID:      1,
			FileName:    "medication_list.pdf",
			FilePath:    "/prescriptions/medication_list.pdf",
			FileType:    "pdf",
			FileSize:    180000,
			UploadDate:  time.Now().Add(-14 * 24 * time.Hour).Format("2006-01-02 15:04:05"),
			Description: "Current medications and dosages",
		},
		{
			UserID:      3,
			FileName:    "cardiology_report.pdf",
			FilePath:    "/prescriptions/cardiology_report.pdf",
			FileType:    "pdf",
			FileSize:    320000,
			UploadDate:  time.Now().Add(-2 * 24 * time.Hour).Format("2006-01-02 15:04:05"),
			Description: "Cardiac assessment report",
		},
	}

	for _, prescription := range prescriptions {
		// Check if prescription already exists
		var existing models.Prescription
		if err := db.DB.Where("file_name = ?", prescription.FileName).First(&existing).Error; err == gorm.ErrRecordNotFound {
			if err := db.DB.Create(&prescription).Error; err != nil {
				log.Printf("❌ Error creating prescription %s: %v", prescription.FileName, err)
			} else {
				log.Printf("✅ Created prescription: %s", prescription.FileName)
			}
		} else {
			log.Printf("⏭️ Prescription already exists: %s", prescription.FileName)
		}
	}
}

// ClearDatabase deletes all seeded data (useful for testing)
func ClearDatabase() {
	log.Println("⚠️ Clearing database...")
	db.DB.Exec("DELETE FROM temporary_access_tokens")
	db.DB.Exec("DELETE FROM prescriptions")
	db.DB.Exec("DELETE FROM view_requests")
	db.DB.Exec("DELETE FROM doctors")
	db.DB.Exec("DELETE FROM users")
	log.Println("✅ Database cleared")
}
