package model

import (
	"time"
)

func (TableAlias) TableName() string {

	return "alias"
}

// swagger:model AliasStruct
type TableAlias struct {
	Id   int    `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"id"`
	GUID string `gorm:"column:guid;type:uuid" json:"guid"`
	// alias name
	// example: verizon
	// required: true
	Alias string `gorm:"column:alias;type:varchar(40)" json:"alias" validate:"required"`
	// example: 192.168.10.20
	// required: true
	IP string `gorm:"column:ip;type:varchar(60)" json:"ip" validate:"required"`
	// example: 5060
	// required: true
	Port int `gorm:"column:port;type:int" json:"port" validate:"required"`
	// example: 32
	// required: true
	Mask int `gorm:"column:mask;type:int" json:"mask" validate:"required"`
	// example: 0
	// required: true
	CaptureID  string    `gorm:"column:captureID;type:varchar(20)" json:"captureID" validate:"required"`
	Status     *bool     `gorm:"column:status;type:bool" json:"status" validate:"required"`
	CreateDate time.Time `gorm:"column:create_date;default:current_timestamp;not null" json:"-"`
}
