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
	ID                 int             `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	GUID               string          `gorm:"column:guid;type:uuid" json:"guid"`
	Profile            string          `gorm:"column:profile;type:varchar(100);not null" json:"profile" validate:"required"`
	Hepid              int             `gorm:"column:hepid;type:int;not null" json:"hepid" validate:"required"`
	HepAlias           string          `gorm:"column:hep_alias;type:varchar(100)" json:"hep_alias"`
	PartID             int             `gorm:"column:partid;type:int;int:10;not null" json:"partid" validate:"required"`
	Version            int             `gorm:"column:version;type:int;not null" json:"version" validate:"required"`
	Retention          int             `gorm:"column:retention;type:int;not null" json:"retention" validate:"required"`
	PartitionStep      int             `gorm:"column:partition_step;int;not null" json:"partition_step" validate:"required"`
	CreateIndex        json.RawMessage `gorm:"column:create_index;default:{};type:json" json:"create_index"`
	CreateTable        string          `gorm:"column:create_table;default:'CREATE TABLE';type:text" json:"create_table"`
	CorrelationMapping json.RawMessage `gorm:"column:correlation_mapping;default:{};type:json" json:"correlation_mapping"`
	FieldsMapping      json.RawMessage `gorm:"column:fields_mapping;default:{};type:json" json:"fields_mapping"`
	MappingSettings    json.RawMessage `gorm:"column:mapping_settings;default:{};type:json" json:"fields_settings"`
	SchemaMapping      json.RawMessage `gorm:"column:schema_mapping;default:{};type:json" json:"schema_mapping"`
	SchemaSettings     json.RawMessage `gorm:"column:schema_settings;default:{};type:json" json:"schema_settings"`
	CreateDate         time.Time       `gorm:"column:create_date;default:current_timestamp;not null" json:"-"`
}
