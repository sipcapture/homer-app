package model

import (
	"encoding/json"
	"time"
)

// swagger:model SearchCallData
type SearchObject struct {
	// required: true
	Param struct {
		Transaction struct {
		} `json:"transaction"`
		// this controls the number of records to display
		// example: 200
		// required: true
		Limit int `json:"limit"`
		// this control the type of search one can perform
		// type: string
		// format: binary
		// example: `{"1_call":[{"name":"limit","value":"10","type":"string","hepid":1}]}`
		Search json.RawMessage `json:"search"`
		// ips to be removed from search
		// required: false
		// type: array
		// items:
		//  type: string
		// 	example: ["192.1698.10.20"]
		WhiteList []string `json:"whitelist"`
		// location
		// required: false
		// type: object
		Location struct {
			Node []string `json:node`
		} `json:"location"`
		// timezone settings
		// type: object
		// default: null
		Timezone struct {
			Value int    `json:"value"`
			Name  string `json:"name"`
		} `json:"timezone"`
	} `json:"param"`
	// this control the time range for used for search
	Timestamp struct {
		// current timestamp in miliseconds
		// required :true
		// example: 1581793200000
		From int64 `json:"from"`
		// current timestamp in miliseconds
		// required :true
		// example: 1581879599000
		To int64 `json:"to"`
	} `json:"timestamp"`
}

type HepTable struct {
	Id             int             `json:"id"`
	Sid            string          `json:"sid"`
	CreatedDate    time.Time       `gorm:"column:create_date" json:"create_date"`
	ProtocolHeader json.RawMessage `gorm:"column:protocol_header" json:"protocol_header"`
	DataHeader     json.RawMessage `gorm:"column:data_header" json:"data_header"`
	Raw            string          `gorm:"column:raw" json:"raw"`
	DBNode         string          `gorm:"column:-" json:"dbnode"`
	Node           string          `gorm:"column:-" json:"node"`
	Profile        string          `gorm:"column:-" json:"profile"`
}

type Message struct {
	Id     int            `json:"id"`
	Sid    string         `json:"sid"`
	ProtoH ProtocolHeader `json:"protocol_header"`
	DataH  DataHeader     `json:"data_header"`
	Raw    string         `json:"raw"`
}

type ProtocolHeader struct {
	DstIP          string `json:"dstIp"`
	SrcIP          string `json:"srcIp"`
	DstPort        int    `json:"dstPort"`
	SrcPort        int    `json:"srcPort"`
	Protocol       int    `json:"protocol"`
	CaptureID      int    `json:"captureId"`
	CapturePass    string `json:"capturePass"`
	PayloadType    int    `json:"payloadType"`
	TimeSeconds    int    `json:"timeSeconds"`
	TimeUseconds   int    `json:"timeUseconds"`
	ProtocolFamily int    `json:"protocolFamily"`
}

type DataHeader struct {
	Callid     string `json:"callid"`
	Method     string `json:"method"`
	ToTag      string `json:"to_tag"`
	ToUser     string `json:"to_user"`
	FromTag    string `json:"from_tag"`
	PidUser    string `json:"pid_user"`
	AuthUser   string `json:"auth_user"`
	FromUser   string `json:"from_user"`
	RuriUser   string `json:"ruri_user"`
	UserAgent  string `json:"user_agent"`
	RuriDomain string `json:"ruri_domain"`
}

/*
type TransactionObject struct {
	Timestamp struct {
		From int64 `json:"from"`
		To   int64 `json:"to"`
	} `json:"timestamp"`
	Param struct {
		Search struct {
			OneCall struct {``
				ID     int           `json:"id"`
				Callid []string      `json:"callid"`
				UUID   []interface{} `json:"uuid"`
			} `json:"1_call"`
		} `json:"search"`
		Location struct {
		} `json:"location"`
		Transaction struct {
			Call         bool `json:"call"`
			Registration bool `json:"registration"`
			Rest         bool `json:"rest"`
		} `json:"transaction"`
		ID struct {
		} `json:"id"`
		Timezone struct {
			Value int    `json:"value"`
			Name  string `json:"name"`
		} `json:"timezone"`
	} `json:"param"`
}
*/

type TransactionResponse struct {
	Total int        `json:"total"`
	D     SecondData `json:"data"`
}

type SecondData struct {
	Messages []Message `json:"messages"`
}

type CallElement struct {
	ID          float64 `json:"id"`
	Sid         string  `json:"sid"`
	DstHost     string  `json:"dstHost"`
	SrcHost     string  `json:"srcHost"`
	DstID       string  `json:"dstId"`
	SrcID       string  `json:"srcId"`
	SrcIP       string  `json:"srcIp"`
	DstIP       string  `json:"dstIp"`
	SrcPort     float64 `json:"srcPort"`
	AliasSrc    string  `json:"aliasSrc"`
	AliasDst    string  `json:"aliasDst"`
	DstPort     float64 `json:"dstPort"`
	Method      string  `json:"method"`
	MethodText  string  `json:"method_text"`
	CreateDate  int64   `json:"create_date"`
	Protocol    float64 `json:"protocol"`
	MsgColor    string  `json:"msg_color"`
	Table       string  `json:"table"`
	RuriUser    string  `json:"ruri_user"`
	Destination int     `json:"destination"`
	MicroTs     int64   `json:"micro_ts"`
}
