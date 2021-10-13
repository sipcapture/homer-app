package model

import (
	"encoding/json"
	"time"
)

func (TableGlobalSettings) TableName() string {
	return "global_settings"
}

// swagger:model GlobalSettingsStruct
type TableGlobalSettings struct {
	Id int `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	// should be a unique value representing GlobalSettings
	// example: e71771a2-1ea0-498f-8d27-391713e10664
	// required: true
	GUID string `gorm:"column:guid;type:uuid" json:"guid" validate:"required"`
	// example: 1
	// required: true
	PartId int `gorm:"column:partid;type:int;not null" json:"partid" validate:"required"`
	// example: profile
	// required: true
	Category string `gorm:"column:category;type:varchar(100);not null" json:"category" validate:"required"`

	CreateDate time.Time `gorm:"column:create_date;default:current_timestamp;not null" json:"-"`
	// example: homer
	// required: true
	Param string `gorm:"column:param;type:varchar(100);not null" json:"param" validate:"required"`

	Data json.RawMessage `gorm:"column:data;type:json" json:"data"`
}

// swagger:model GlobalSettingsStructList
type GlobalSettingsStructList struct {
	Count int                   `json:"count"`
	Data  []TableGlobalSettings `json:"data"`
}

// swagger:model GlobalSettingsCreateSuccessfulResponse
type GlobalSettingsCreateSuccessfulResponse struct {
	// example: af72057b-2745-0a1b-b674-56586aadec57
	Data string `json:"data"`
	// example: successfully created GlobalSetting
	Message string `json:"message"`
}

// swagger:model GlobalSettingsUpdateSuccessfulResponse
type GlobalSettingsUpdateSuccessfulResponse struct {
	// example: af72057b-2745-0a1b-b674-56586aadec57
	Data string `json:"data"`
	// example: successfully updated GlobalSetting
	Message string `json:"message"`
}

// swagger:model GlobalSettingsDeleteSuccessfulResponse
type GlobalSettingsDeleteSuccessfulResponse struct {
	// example: af72057b-2745-0a1b-b674-56586aadec57
	Data string `json:"data"`
	// example: successfully deleted GlobalSetting
	Message string `json:"message"`
}
