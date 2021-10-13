package model

import (
	"encoding/json"
)

// swagger:model RemoteRequest
type RemoteObject struct {
	Param struct {
		// example: 100
		Limit int `json:"limit"`
		// example: {type="call"}
		Search string `json:"search"`
		// example: http://localhost:3100
		Server   string          `json:"server"`
		Timezone json.RawMessage `json:"timezone"`
	} `json:"param"`
	Timestamp struct {
		From int64 `json:"from"`
		To   int64 `json:"to"`
	} `json:"timestamp"`
}

type RemoteResponse struct {
	Total int             `json:"total"`
	D     json.RawMessage `json:"data"`
}

// Salutation : here you tell us what Salutation is
// Printer : what is this?
// Greet : describe what this function does
// CreateMessage : describe what this function does
type RemotePoint struct {
	Attemps     int     `json:"attemps"`
	Partid      int     `json:"partid"`
	Group       int     `json:"group"`
	Id          int     `json:"id"`
	Reporttime  int64   `json:"reporttime"`
	Table       string  `json:"table"`
	Tag1        string  `json:"tag1"`
	Transaction string  `json:"transaction"`
	Countername string  `json:"countername"`
	Value       float64 `json:"value"`
}

// swagger:model RemoteLabels
type RemoteLabels []string

// swagger:model RemoteValues
type RemoteValues []string

//swagger:model RemoteResponseData
type RemoteResponseData struct {
	Data []struct {
		// example:
		Custom1 string `json:"custom_1"`
		// example: {"duration":"0","from_user":"1201","ruri_user":"102110112384797001",status":"8","type":"call"}
		Custom2 string `json:"custom_2"`
		// example: 1
		ID int `json:"id"`
		// example: 1634081796154
		MicroTs int `json:"micro_ts"`
	}
}
