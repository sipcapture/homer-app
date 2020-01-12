package model

import (
	"time"
)

func (TableVersions) TableName() string {
	return "versions"
}

type TableVersions struct {
	Id int `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	// required: true
	NameTable string `gorm:"column:table_name;type:varchar(50);not null" json:"table_name" validate:"required"`
	// example: 10
	VersionTable int       `gorm:"column:table_version;type:int;default:10;not null" json:"table_version" validate:"required"`
	CreatedAt    time.Time `gorm:"column:created_at;default:current_timestamp;not null" json:"-"`
}
