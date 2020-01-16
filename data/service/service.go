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
}

// ServicePrometheus : here you tell us what ServicePrometheus is
type ServicePrometheus struct {
	HttpClient *http.Client
	User       string
	Password   string
	Host       string
	Api        string
}

// ServiceRemote : here you tell us what ServiceRemote is
type ServiceRemote struct {
	HttpClient *http.Client
	User       string
	Password   string
	Host       string
	Api        string
}
