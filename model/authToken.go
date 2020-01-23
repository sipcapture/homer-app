package model

import (
	"encoding/json"
	"time"
)

func (TableAuthToken) TableName() string {
	return "auth_token"
}

type TableAuthToken struct {
	ID            int             `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	GUID          string          `gorm:"column:guid;type:uuid" json:"guid"`
	UserGUID      string          `gorm:"column:creator_guid;type:uuid" json:"creator_guid"`
	Token         string          `gorm:"column:token;type:varchar(250)" json:"-"`
	UserObject    json.RawMessage `gorm:"column:user_object;type:json" json:"user_object"`
	CreateDate    time.Time       `gorm:"column:create_date;default:current_timestamp;not null" json:"create_date"`
	LastUsageDate time.Time       `gorm:"column:lastusage_date;not null" json:"lastusage_date"`
	ExpireDate    time.Time       `gorm:"column:expire_date;not null" json:"expire_date"`
	UsageCalls    int             `gorm:"column:usage_calls;type:int;default:1" json:"usage_calls"`
	LimitCalls    int             `gorm:"column:limit_calls;type:int;default:1000" json:"limit_calls"`
	Active        int             `gorm:"column:active;type:int;default:1" json:"active"`
}
