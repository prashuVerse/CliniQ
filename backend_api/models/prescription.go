package models

import (
	"gorm.io/gorm"
)

type Prescription struct {
	gorm.Model
	UserID      uint   `json:"user_id" gorm:"index"` // Link to patient (User)
	FileName    string `json:"file_name"`
	FilePath    string `json:"file_path"`
	FileType    string `json:"file_type"` // "pdf" or "txt"
	FileSize    int64  `json:"file_size"` // Size in bytes
	UploadDate  string `json:"upload_date"`
	Description string `json:"description"` // Optional description
	User        User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
}
