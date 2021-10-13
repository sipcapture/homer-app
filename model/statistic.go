package model

import (
	"encoding/json"
)

// swagger:model StatisticObject
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

// swagger:model StatisticSearchObject
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

// swagger:model StatisticDb
type StatisticDb struct {
	Data struct {
		Results []struct {
			Series []struct {
				// example: databases
				Name string `json:"name"`
				// example: ["name"]
				Columns []string `json:"columns"`
				// example: [["telegraf"], ["_internal"], ["homer"]]
				Values [][]string `json:"values"`
			} `json:"Series"`
			Messages interface{} `json:"Messages"`
		} `json:"Results"`
	} `json:"data"`
	// example: ok
	Status string `json:"status"`
	// example: 1
	Total int `json:"total"`
}

// swagger:model StatisticRetentions
type StatisticRetentions struct {
	Data struct {
		Results []struct {
			Series []struct {
				// example: ["name", "duration", "shardGroupDuration", "replicaN", "default"]
				Columns []string `json:"columns"`
				// example: [["autogen", "0s", "168h0m0s", 1, true]]
				Values [][]interface{} `json:"values"`
			} `json:"Series"`
			Messages interface{} `json:"Messages"`
		} `json:"Results"`
	} `json:"data"`
	// example: ok
	Status string `json:"status"`
	// example: 1
	Total int `json:"total"`
}
