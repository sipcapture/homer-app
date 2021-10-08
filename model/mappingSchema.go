package model

import (
	"encoding/json"
	"time"
)

func (TableMappingSchema) TableName() string {
	return "mapping_schema"
}

// swagger:model MappingSchema
type TableMappingSchema struct {
	ID int `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	// example:a006a250-c261-4052-b1c2-6cb85ed580c2
	GUID string `gorm:"column:guid;type:uuid" json:"guid"`
	// example: call
	Profile string `gorm:"column:profile;type:varchar(100);not null" json:"profile" validate:"required"`
	// example: 1
	Hepid int `gorm:"column:hepid;type:int;not null" json:"hepid" validate:"required"`
	// example: SIP
	HepAlias string `gorm:"column:hep_alias;type:varchar(100)" json:"hep_alias"`
	// example: 10
	PartID int `gorm:"column:partid;type:int;int:10;not null" json:"partid" validate:"required"`
	// example: 1
	Version int `gorm:"column:version;type:int;not null" json:"version" validate:"required"`
	// example: 10
	Retention int `gorm:"column:retention;type:int;not null" json:"retention" validate:"required"`
	// example: 10
	PartitionStep int             `gorm:"column:partition_step;int;not null" json:"partition_step" validate:"required"`
	CreateIndex   json.RawMessage `gorm:"column:create_index;default:'{}';type:json" json:"create_index"`
	// example: CREATE TABLE test(id integer, data text);
	CreateTable        string          `gorm:"column:create_table;default:'CREATE TABLE';type:text" json:"create_table"`
	CorrelationMapping json.RawMessage `gorm:"column:correlation_mapping;default:'{}';type:json" json:"correlation_mapping"`
	FieldsMapping      json.RawMessage `gorm:"column:fields_mapping;default:'{}';type:json" json:"fields_mapping"`
	MappingSettings    json.RawMessage `gorm:"column:mapping_settings;default:'{}';type:json" json:"fields_settings"`
	SchemaMapping      json.RawMessage `gorm:"column:schema_mapping;default:'{}';type:json" json:"schema_mapping"`
	SchemaSettings     json.RawMessage `gorm:"column:schema_settings;default:'{}';type:json" json:"schema_settings"`
	CreateDate         time.Time       `gorm:"column:create_date;default:current_timestamp;not null" json:"-"`
}

// swagger:model MappingSchemaList
type MappingSchemaList struct {
	// example: 1
	Count int                  `json:"count"`
	Data  []TableMappingSchema `json:"data"`
}

// swagger:model MappingUpdateSuccessResponse
type MappingUpdateSuccessResponse struct {
	// example: 4b855914-ca3d-4562-8563-f2b660fe2636
	Data string `json:"data"`
	// example: successfully updated mapping settings
	Message string `json:"message"`
}

// swagger:model MappingCreateSuccessResponse
type MappingCreateSuccessResponse struct {
	// example: 4b855914-ca3d-4562-8563-f2b660fe2636
	Data string `json:"data"`
	// example: successfully created mapping settings
	Message string `json:"message"`
}

// swagger:model MappingDeleteSuccessResponse
type MappingDeleteSuccessResponse struct {
	// example: 4b855914-ca3d-4562-8563-f2b660fe2636
	Data string `json:"data"`
	// example: successfully deleted mapping settings
	Message string `json:"message"`
}

// swagger:model SmartSearchField
type SmartSearchField struct {
	// example: sip
	Category string `json:"category"`
	// example: callid
	Name string `json:"name"`
	// example: sip.callid
	Value string `json:"value"`
}

// swagger:model SmartSearchFieldList
type SmartSearchFieldList struct {
	Data struct {
		Data []SmartSearchField `json:"data"`
	} `json:"data"`
}

type MappingSmart struct {
	Value string
	Type  string
}
