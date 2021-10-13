package model

import (
	"time"
)

func (TableAgentLocationSession) TableName() string {
	return "agent_location_session"
}

// swagger:model AgentsLocation
type TableAgentLocationSession struct {
	ID         int       `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	GUID       string    `gorm:"column:guid;type:uuid" json:"uuid" validate:"required"`
	Gid        int       `gorm:"column:gid;type:int" json:"gid" validate:"required"`
	Host       string    `gorm:"column:host;type:varchar(250);default:'127.0.0.1'" json:"host" validate:"required"`
	Port       int       `gorm:"column:port;type:int;default:8080" json:"port"`
	Protocol   string    `gorm:"column:protocol;type:varchar(50);default:'log'" json:"protocol"`
	Path       string    `gorm:"column:path;type:varchar(250);default:'/api/search'" json:"path"`
	Node       string    `gorm:"column:node;type:varchar(100);default:'testnode'" json:"node"`
	Type       string    `gorm:"column:type;type:varchar(200);default:'type'" json:"type"`
	TTL        int       `gorm:"-" json:"ttl"`
	CreateDate time.Time `gorm:"column:create_date;default:current_timestamp;not null" json:"create_date"`
	ExpireDate time.Time `gorm:"column:expire_date;not null" json:"expire_date"`
	Active     int       `gorm:"column:active;type:int;default:1" json:"active"`
}

// swagger:model AgentsLocationList
type TableAgentLocationSessionList struct {
	Data []TableAgentLocationSession `json:"data"`
}

// swagger:model AgentLocationUpdateSuccessResponse
type AgentLocationUpdateSuccessResponse struct {
	// example: 4b855914-ca3d-4562-8563-f2b660fe2636
	Data string `json:"data"`
	// example: successfully updated AgentLocation settings
	Message string `json:"message"`
}

// swagger:model AgentLocationCreateSuccessResponse
type AgentLocationCreateSuccessResponse struct {
	// example: 4b855914-ca3d-4562-8563-f2b660fe2636
	Data string `json:"data"`
	// example: successfully created AgentLocation settings
	Message string `json:"message"`
}

// swagger:model AgentLocationDeleteSuccessResponse
type AgentLocationDeleteSuccessResponse struct {
	// example: 4b855914-ca3d-4562-8563-f2b660fe2636
	Data string `json:"data"`
	// example: successfully deleted AgentLocation settings
	Message string `json:"message"`
}
