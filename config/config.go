package config

var Setting HomerSettingServer

type HomerSettingServer struct {
	IsolateQuery        string `default:""`
	IsolateGroup        string `default:""`
	UseCaptureIDInAlias bool   `default:"false"`

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

	LOG_SETTINGS struct {
		Enable        bool   `default:"true"`
		MaxAgeDays    uint32 `default:"7"`
		RotationHours uint32 `default:"24"`
		Path          string `default:"/usr/local/homer/log"`
		Level         string `default:"error"`
		Name          string `default:"homer-app.log"`
		Stdout        bool   `default:"false"`
		Json          bool   `default:"true"`
		SysLogLevel   string `default:"LOG_INFO"`
		SysLog        bool   `default:"false"`
		SyslogUri     string `default:""`
	}

	SWAGGER struct {
		Enable  bool   `default:"true"`
		ApiJson string `default:"/usr/local/homer/etc/swagger.json"`
		ApiHost string `default:"127.0.0.1:9080"`
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
