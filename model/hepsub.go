package model

import (
	"encoding/json"
	"time"
)

func (TableHepsubSchema) TableName() string {
	return "hepsub_mapping_schema"
}

// swagger:model HepsubSchema
type TableHepsubSchema struct {
	ID         int             `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	GUID       string          `gorm:"column:guid;type:uuid" json:"guid" validate:"required"`
	Profile    string          `gorm:"column:profile;type:varchar(100)" json:"profile" validate:"required"`
	Hepid      int             `gorm:"column:hepid;type:varchar(250)" json:"hepid" validate:"required"`
	HepAlias   string          `gorm:"column:hep_alias;type:varchar(250)" json:"hep_alias" validate:"required"`
	Version    int             `gorm:"column:version;type:varchar(50)" json:"version" validate:"required"`
	Mapping    json.RawMessage `gorm:"column:mapping" json:"mapping" validate:"required"`
	CreateDate time.Time       `gorm:"column:create_date;default:current_timestamp;not null" json:"-"`
}
