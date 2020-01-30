package model

import (
	"encoding/json"
)

type GrafanaObject struct {
	Param struct {
		Limit    int             `json:"limit"`
		Search   string          `json:"search"`
		Server   string          `json:"server"`
		Timezone json.RawMessage `json:"timezone"`
	} `json:"param"`
	Timestamp struct {
		From int64 `json:"from"`
		To   int64 `json:"to"`
	} `json:"timestamp"`
}

type GrafanaResponse struct {
	Total int             `json:"total"`
	D     json.RawMessage `json:"data"`
}

// Salutation : here you tell us what Salutation is
// Printer : what is this?
// Greet : describe what this function does
// CreateMessage : describe what this function does
type GrafanaPoint struct {
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
