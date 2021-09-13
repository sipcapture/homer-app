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

	TRANSACTION_SETTINGS struct {
		DedupModel        string `default:"message-ip-pair"`
		GlobalDeduplicate bool   `default:"false"`
	}

	DASHBOARD_SETTINGS struct {
		ExternalHomeDashboard string `default:""`
	}

	DECODER_SHARK struct {
		Bin        string   `default:"/usr/local/bin/tshark"`
		Param      string   `default:""`
		Protocols  []string `default:""`
		UID        uint32   `default:"0"`
		GID        uint32   `default:"0"`
		ImportNode string   `default:""`
		Enable     bool     `default:"false"`
	}
}
