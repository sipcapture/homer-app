package model

import (
	"time"
)

//table  name
func (TableApplications) TableName() string {
	return "applications"
}

//table app
type TableApplications struct {
	ID                 int       `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	GUID               string    `gorm:"column:guid;type:uuid" json:"guid" validate:"required"`
	NameApplication    string    `gorm:"column:name;type:varchar(50);unique_index:idx_name_host;not null" json:"application_name" validate:"required"`
	HostApplication    string    `gorm:"column:host;type:varchar(100);unique_index:idx_name_host;not null" json:"application_host" validate:"required"`
	VersionApplication string    `gorm:"column:version;type:varchar(100);not null" json:"application_version" validate:"required"`
	CreatedAt          time.Time `gorm:"column:created_at;default:current_timestamp;not null" json:"-"`
}
