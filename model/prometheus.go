package model

import (
	"encoding/json"
)

type PrometheusObject struct {
	Param struct {
		Limit     int      `json:"limit"`
		Precision int      `json:"precision"`
		Metrics   []string `json:"metrics"`
		Total     bool     `json:"total"`
	} `json:"param"`
	Timestamp struct {
		From int64 `json:"from"`
		To   int64 `json:"to"`
	} `json:"timestamp"`
}

type PrometheusResponse struct {
	Total int             `json:"total"`
	D     json.RawMessage `json:"data"`
}

// Salutation : here you tell us what Salutation is
// Printer : what is this?
// Greet : describe what this function does
// CreateMessage : describe what this function does
type PrometheusPoint struct {
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
