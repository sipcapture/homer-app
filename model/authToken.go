package model

import (
	"encoding/json"
	"time"
)

func (TableAuthToken) TableName() string {
	return "auth_token"
}

// swagger:model AuthToken
type TableAuthToken struct {
	ID            int             `gorm:"column:id;primary_key;AUTO_INCREMENT" json:"-"`
	GUID          string          `gorm:"column:guid;type:uuid" json:"guid"`
	UserGUID      string          `gorm:"column:creator_guid;type:uuid" json:"creator_guid"`
	Name          string          `gorm:"column:name;type:varchar(100)" json:"name" validate:"required"`
	Token         string          `gorm:"column:token;type:varchar(250)" json:"-"`
	UserObject    json.RawMessage `gorm:"column:user_object;type:json" json:"user_object"`
	IPAddress     string          `gorm:"column:ip_address;type:inet" json:"ip_address"`
	CreateDate    time.Time       `gorm:"column:create_date;default:current_timestamp;not null" json:"create_date"`
	LastUsageDate time.Time       `gorm:"column:lastusage_date;not null" json:"lastusage_date"`
	ExpireDate    time.Time       `gorm:"column:expire_date;not null" json:"expire_date" validate:"required"`
	UsageCalls    int             `gorm:"column:usage_calls;type:int;default:1" json:"usage_calls"`
	LimitCalls    int             `gorm:"column:limit_calls;type:int;default:1000" json:"limit_calls"`
	Active        *bool           `gorm:"column:active;type:bool" json:"active" validate:"required"`
}

// swagger:model AuthToken
type AuthToken struct {
	Count int `json:"count"`
	Data  []struct {
		// example: 9e4afbd5-7453-415d-b2d4-181057afbfe5"
		GUID string `json:"guid"`
		// example: ced47b64-ae93-417b-9e1b-8dd1b1410807
		CreatorGUID string `json:"creator_guid"`
		// example: JGoolsby-Api
		Name       string `json:"name"`
		UserObject struct {
			// example: JGoolsby
			Username string `json:"username"`
			// example: James
			Firstname string `json:"firstname"`
			// example:Goolsby
			Lastname string `json:"lastname"`
			// example: JGoolsby@example.com
			Email string `json:"email"`
			// example: admin
			Usergroup string `json:"usergroup"`
			// example: 1000
			ID int `json:"id"`
			// example: 10
			Partid int `json:"partid"`
		} `json:"user_object"`
		// example:
		IPAddress string `json:"ip_address"`
		// example: 2021-10-01T17:36:21.80063Z
		CreateDate string `json:"create_date"`
		// example: 2021-10-08T17:36:21.80063Z
		LastusageDate string `json:"lastusage_date"`
		// example: 2021-10-09T17:36:21.80063Z
		ExpireDate string `json:"expire_date"`
		// example: 1
		UsageCalls int `json:"usage_calls"`
		// example: 1000
		LimitCalls int `json:"limit_calls"`
		// example: true
		Active bool `json:"active"`
	} `json:"data"`
}

// swagger:model AuthTokenList
type AuthTokenList struct {
	Data []AuthToken `json:"data"`
	// example: 2
	Count int `json:"count"`
}

// swagger:model AuthTokenCreateSuccessfulResponse
type AuthTokenCreateSuccessfulResponse struct {
	Data struct {
		// example: xeCbhpWTrjvJTsTvhTdDXHyXnKTFNecRndhXTiXvDCtdmpeFyvWGxsufJzwyyEXrxuqdAZlTaVmbufdG
		Token string `json:"token"`
	} `json:"data"`
	// example: successfully created auth token
	Message string `json:"message"`
}

// swagger:model AuthTokenDeleteSuccessfulResponse
type AuthTokenDeleteSuccessfulResponse struct {
	// example: f4e2953e-ab42-40df-a7de-9ceb7faca396
	Data string `json:"data"`
	// example: successfully deleted authtoken
	Message string `json:"message"`
}

// swagger:model AuthTokenUpdateSuccessfulResponse
type AuthTokenUpdateSuccessfulResponse struct {
	// example: f4e2953e-ab42-40df-a7de-9ceb7faca396
	Data string `json:"data"`
	// example: successfully updated authtoken
	Message string `json:"message"`
}

// swagger:model UserObjectToken
type UserObjectToken struct {
	UserName  string `default:"test" json:"username"`
	FirstName string `default:"Tester" json:"firstname"`
	Lastname  string `default:"Tester" json:"lastname"`
	Email     string `default:"tester@test.com" json:"email"`
	Usergroup string `default:"user" json:"usergroup"`
	ID        uint32 `default:"1000" json:"id"`
	PartID    uint32 `default:"10" json:"partid"`
}
