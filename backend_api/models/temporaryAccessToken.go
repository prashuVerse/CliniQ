package models

import (
	"time"

	"gorm.io/gorm"
)

// TemporaryAccessToken represents a QR-based temporary access grant
type TemporaryAccessToken struct {
	gorm.Model
	PatientID   uint      `json:"patient_id" gorm:"index"`                    // Patient offering access
	DoctorID    *uint     `json:"doctor_id"`                                  // Doctor who scanned (optional, can be pre-filled)
	Token       string    `json:"token" gorm:"uniqueIndex"`                   // Unique token for verification
	QRCode      string    `json:"qr_code" gorm:"type:text"`                   // Base64 encoded QR code image
	ExpiresAt   time.Time `json:"expires_at" gorm:"index"`                    // Token expiration time
	IsUsed      bool      `json:"is_used" gorm:"default:false"`               // Whether token has been scanned
	UsedAt      *time.Time `json:"used_at"`                                   // When the token was used
	AccessLevel string    `json:"access_level"`                               // Level of access: "BASIC", "FULL"
}

// IsValid checks if the token is still valid (not expired and not used)
func (t *TemporaryAccessToken) IsValid() bool {
	return time.Now().Before(t.ExpiresAt) && !t.IsUsed
}

// GetRemainingTime returns how much time is left before expiration
func (t *TemporaryAccessToken) GetRemainingTime() time.Duration {
	return time.Until(t.ExpiresAt)
}

