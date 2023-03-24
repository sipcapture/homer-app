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
	Alias string `gorm:"column:alias;type:varchar(250)" json:"alias" validate:"required"`
	// example: 192.168.10.20
	// required: true
	IP string `gorm:"column:ip;type:varchar(60)" json:"ip" validate:"required,ip"`
	// example: 5060
	// required: true
	Port *int `gorm:"column:port;type:int;default:0" json:"port" validate:"required,numeric"`
	// example: 32
	// required: true
	Mask *int `gorm:"column:mask;type:int" json:"mask" validate:"required,numeric"`
	// example: 0
	// required: true
	CaptureID  string    `gorm:"column:captureID;type:varchar(20)" json:"captureID" validate:"required"`
	Status     *bool     `gorm:"column:status;type:bool" json:"status" validate:"required"`
	CreateDate time.Time `gorm:"column:create_date;default:current_timestamp;not null" json:"-"`
}

// swagger:model AliasStructList
type TableAliasList struct {
	Data []TableAlias `json:"data"`
}

// swagger:model AliasCreationSuccessResponse
type AliasCreationSuccessResponse struct {
	// example: f2d0a540-bf21-4c0d-ac73-8696ea10855a
	Data string `json:"data"`
	// example: successfully created alias
	Message string `json:"message"`
}

// swagger:model AliasUpdateSuccessResponse
type AliasUpdateSuccessResponse struct {
	// example: f2d0a540-bf21-4c0d-ac73-8696ea10855a
	Data string `json:"data"`
	// example: successfully updated alias
	Message string `json:"message"`
}

// swagger:model AliasDeleteSuccessResponse
type AliasDeleteSuccessResponse struct {
	// example: f2d0a540-bf21-4c0d-ac73-8696ea10855a
	Data string `json:"data"`
	// example: successfully deleted alias
	Message string `json:"message"`
}
