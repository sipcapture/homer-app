package model

import (
	"encoding/json"
	"time"
)

func (TableUserSettings) TableName() string {
	return "user_settings"
}

// swagger:model UserSettings
type TableUserSettings struct {
	Id int `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"id"`
	// should be a unique value representing user
	// example: e71771a2-1ea0-498f-8d27-391713e10664
	// required: true
	GUID string `gorm:"column:guid;type:uuid" json:"guid" validate:"required"`
	// required: true
	UserName string `gorm:"column:username;type:varchar(100);not null" json:"username" validate:"required"`
	// example: 10
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
	//Data map[string]interface{} `gorm:"column:data;type:json" json:"data"`
}

type DashBoardElement struct {
	CssClass string  `json:"cssclass"`
	Href     string  `json:"href"`
	Id       string  `json:"id"`
	Name     string  `json:"name"`
	Param    string  `json:"param"`
	Shared   int     `json:"shared"`
	Type     int     `json:"type"`
	Weight   float64 `json:"weight"`
}
