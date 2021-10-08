package model

import (
	"encoding/json"
)

type StatisticObject struct {
	Param struct {
		Limit     int `json:"limit"`
		Precision int `json:"precision"`
		Query     []struct {
			Main      string   `json:"main"`
			Database  string   `json:"database"`
			Retention string   `json:"retention"`
			Rawquery  string   `json:"rawquery"`
			Type      []string `json:"type"`
			Tag       []string `json:"tag"`
		} `json:"query"`
		Bfrom int  `json:"bfrom"`
		Total bool `json:"total"`
	} `json:"param"`
	Timestamp struct {
		From int64 `json:"from"`
		To   int64 `json:"to"`
	} `json:"timestamp"`
}

type StatisticSearchObject struct {
	Param struct {
		Limit     int `json:"limit"`
		Precision int `json:"precision"`
		Search    struct {
			Database string `json:"database"`
		} `json:"search"`
		Bfrom int  `json:"bfrom"`
		Total bool `json:"total"`
	} `json:"param"`
	Timestamp struct {
		From int64 `json:"from"`
		To   int64 `json:"to"`
	} `json:"timestamp"`
}

type InfluxDatabasesPolices struct {
	Name string `json:"name"`
}

type InfluxDatabasesMeasurements struct {
	Name string `json:"name"`
}

type StatisticResponse struct {
	Total int             `json:"total"`
	D     json.RawMessage `json:"data"`
}

type StatisticPoint struct {
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
