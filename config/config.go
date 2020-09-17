package config

var Setting HomerSettingServer

type HomerSettingServer struct {
	IsolateQuery string `default:""`
	IsolateGroup string `default:""`
}
