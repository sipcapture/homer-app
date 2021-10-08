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
	ID int `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	// example: 4b855914-ca3d-4562-8563-f2b660fe2636
	GUID string `gorm:"column:guid;type:uuid" json:"guid" validate:"required"`
	// example: call
	Profile string `gorm:"column:profile;type:varchar(100)" json:"profile" validate:"required"`
	// example: 1
	Hepid int `gorm:"column:hepid;type:varchar(250)" json:"hepid" validate:"required"`
	// example: SIP
	HepAlias string `gorm:"column:hep_alias;type:varchar(250)" json:"hep_alias" validate:"required"`
	// example: 1603221345489
	Version int             `gorm:"column:version;type:varchar(50)" json:"version" validate:"required"`
	Mapping json.RawMessage `gorm:"column:mapping" json:"mapping" validate:"required"`
	// example: 2020-10-20T21:15:45+02:00
	CreateDate time.Time `gorm:"column:create_date;default:current_timestamp;not null" json:"-"`
}

// swagger:model HepsubSchemaList
type HepsubSchemaList struct {
	Data []TableHepsubSchema `json:"data"`
	// example:
	Count int `json:"count"`
}

// swagger:model HepsubUpdateSuccessResponse
type HepsubUpdateSuccessResponse struct {
	// example: 4b855914-ca3d-4562-8563-f2b660fe2636
	Data string `json:"data"`
	// example: successfully updated hepsub settings
	Message string `json:"message"`
}

// swagger:model HepsubCreateSuccessResponse
type HepsubCreateSuccessResponse struct {
	// example: 4b855914-ca3d-4562-8563-f2b660fe2636
	Data string `json:"data"`
	// example: successfully created hepsub settings
	Message string `json:"message"`
}

// swagger:model HepsubDeleteSuccessResponse
type HepsubDeleteSuccessResponse struct {
	// example: 4b855914-ca3d-4562-8563-f2b660fe2636
	Data string `json:"data"`
	// example: successfully deleted hepsub settings
	Message string `json:"message"`
}
