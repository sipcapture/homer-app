package model

import (
	"encoding/json"
	"time"
)

func (TableRawData) TableName() string {

	return "hep_proto_200_default"
}

// swagger:model TableRtpStatsV2
type TableRawData struct {
	Id int `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"id"`
	// should be a unique value representing user
	// example: e71771a2-1ea0-498f-8d27-391713e10664
	// required: true
	SID string `gorm:"column:sid;type:varchar" json:"sid" validate:"required"`
	//Create data
	CreateDate time.Time `gorm:"column:create_date;default:current_timestamp;not null" json:"create_date"`
	//protocol_header
	ProtocolHeader json.RawMessage `gorm:"column:protocol_header;type:jsonb;not null" json:"protocol_header"`
	//data_header
	DataHeader json.RawMessage `gorm:"column:data_header;type:jsonb;not null" json:"data_header"`
	//raw
	Raw json.RawMessage `gorm:"column:raw;type:jsonb;not null" json:"raw"`
}
