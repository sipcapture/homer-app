package model

import (
	"encoding/json"
)

// swagger:model PrometheusObject
type PrometheusObject struct {
	Param struct {
		// example:500
		Limit int `json:"limit"`
		// example: 3600
		Precision int `json:"precision"`
		// example: ["go_goroutines"]
		Metrics []string `json:"metrics"`
		// false
		Total bool `json:"total"`
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

// swagger:model ListLabels
type ListLabels []string

// swagger:model Label
type Label []struct {
	// example: localhost:9090
	Instance string `json:"instance"`
	// example: prometheus
	Job     string `json:"job"`
	Version string `json:"version"`
	// example: go_routines
	Name string `json:"__name__"`
}

// swagger:model PrometheusResponse
type PrometheusResponseValue struct {
	Success string `json:"success"`
	Data    struct {
		// example: matrix
		ResultType string `json:"resultType"`
		Result     []struct {
			Metric struct {
				// example: go_routines
				Name string `json:"__name__"`
				// example: localhost:9090
				Instance string `json:"instance"`
				// example: prometheus
				Job string `json:"job"`
			} `json:"metric"`
			Values [][]interface{} `json:"values"`
		} `json:"result"`
	} `json:"data"`
}
