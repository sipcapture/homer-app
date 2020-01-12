package model

import (
	"time"
)

func (TableAgentLocationSession) TableName() string {
	return "agent_location_session"
}

type TableAgentLocationSession struct {
	Id         int       `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	GUID       string    `gorm:"column:guid;type:uuid" json:"guid"`
	Gid        int       `gorm:"column:gid;type:int" json:"gid" validate:"required"`
	Host       string    `gorm:"column:host;type:varchar(250);default:'127.0.0.1'" json:"host" validate:"required"`
	Port       int       `gorm:"column:port;type:int;default:8080" json:"port"`
	Protocol   string    `gorm:"column:protocol;type:varchar(50);default:'log'" json:"protocol"`
	Path       string    `gorm:"column:path;type:varchar(250);default:'/api/search'" json:"path"`
	Node       string    `gorm:"column:node;type:varchar(100);default:'testnode'" json:"node"`
	Type       string    `gorm:"column:type;type:varchar(200);default:'type'" json:"type"`
	CreateDate time.Time `gorm:"column:create_date;default:current_timestamp;not null" json:"create_date"`
	ExpireDate time.Time `gorm:"column:expire_date;not null" json:"expire_date"`
	Active     int       `gorm:"column:active;type:int;default:1" json:"active"`
}
