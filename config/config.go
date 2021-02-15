package config

var Setting HomerSettingServer

type HomerSettingServer struct {
	IsolateQuery string `default:""`
	IsolateGroup string `default:""`

	GRAFANA_SETTINGS struct {
		URL      string `default:"http://grafana/"`
		AuthKey  string `default:""`
		User     string `default:""`
		Password string `default:""`
		Path     string `default:"/grafana"`
		Enable   bool   `default:"false"`
	}
}
