package service

import (
	"net/http"

	client "github.com/influxdata/influxdb1-client/v2"
	"github.com/jinzhu/gorm"
)

// Service : here you tell us what Salutation is
type ServiceData struct {
	Session map[string]*gorm.DB
	Decoder ExternalDecoder
}

//ServiceConfig
type ServiceConfig struct {
	Session *gorm.DB
}

// ServiceInfluxDB : here you tell us what ServiceInfluxDB is
type ServiceInfluxDB struct {
	InfluxClient client.Client
	Active       bool
}

// ServicePrometheus : here you tell us what ServicePrometheus is
type ServicePrometheus struct {
	HttpClient *http.Client
	User       string
	Password   string
	Host       string
	Api        string
	Active     bool
}

// ServiceRemote : here you tell us what ServiceRemote is
type ServiceLoki struct {
	HttpClient *http.Client
	User       string
	Password   string
	Host       string
	Api        string
	ParamQuery string
	Active     bool
}

// ServiceGrafana : here you tell us what ServiceRemote is
type ServiceGrafana struct {
	HttpClient *http.Client
	User       string
	Token      string
	Password   string
	Host       string
	Api        string
	Active     bool
}
