package config

import (
	"net/http"

	"github.com/sipcapture/homer-app/model"
	"golang.org/x/oauth2"
)

var Setting HomerSettingServer

var OAuth2TokenMap map[string]model.OAuth2MapToken

type HomerSettingServer struct {
	MAIN_SETTINGS struct {
		IsolateQuery        string `default:""`
		IsolateGroup        string `default:""`
		UseCaptureIDInAlias bool   `default:"false"`
		DefaultAuth         string `default:"internal"`
		EnableGravatar      bool   `default:"false"`
		GravatarUrl         string `default:"https://www.gravatar.com/avatar/%s.jpg"`
		OAuth2Config        oauth2.Config
		GlobalToken         *oauth2.Token
		UserGroups          []string `default:"[admin,user,support]"`
		SubscribeHttpClient *http.Client
		TimeoutHttpClient   uint32 `default:"10"`
	}

	GRAFANA_SETTINGS struct {
		URL          string `default:"http://grafana:3000/"`
		AuthKey      string `default:""`
		User         string `default:""`
		Password     string `default:""`
		ProxyControl bool   `default:"false"`
		Path         string `default:"grafana"`
		ProxyCheck   string `default:"simple"`
		Enable       bool   `default:"false"`
	}

	TRANSACTION_SETTINGS struct {
		DedupModel        string `default:"message-ip-pair"`
		GlobalDeduplicate bool   `default:"false"`
	}

	DASHBOARD_SETTINGS struct {
		ExternalHomeDashboard string `default:""`
	}

	AUTH_SETTINGS struct {
		JwtSecret       string `default:""`
		AuthTokenHeader string `default:"Auth-Token"`
		AuthTokenExpire uint32 `default:"1200"`
	}

	API_SETTINGS struct {
		EnableTokenAccess bool `default:"false"`
	}

	OAUTH2_SETTINGS struct {
		Enable               bool     `default:"false"`
		ClientID             string   `default:"1234565"`
		ClientSecret         string   `default:"FAKE"`
		ProjectID            string   `default:"Homer Oauth2"`
		AuthUri              string   `default:"https://accounts.google.com/o/oauth2/auth"`
		TokenUri             string   `default:"https://oauth2.googleapis.com/token"`
		AuthProviderCert     string   `default:"https://www.googleapis.com/oauth2/v1/certs"`
		RedirectUri          string   `default:"http://localhost:80/api/v3/oauth2/auth"`
		ProfileURL           string   `default:"https://www.googleapis.com/oauth2/v1/userinfo"`
		Method               string   `default:"GET"`
		ResponseType         string   `default:"code"`
		GrantType            string   `default:"authorization_code"`
		UsePkce              bool     `default:"true"`
		UserToken            string   `default:"randommin43characterstringisneededasusertoken"`
		ServiceProviderName  string   `default:"google"`
		ServiceProviderImage string   `default:""`
		StateValue           string   `default:"jkwh027yasj"`
		UrlToServiceRedirect string   `default:"/api/v3/oauth2/redirect"`
		UrlToService         string   `default:"/"`
		Scope                []string `default:"[email,openid,profile]"`
		EnableGravatar       bool     `default:"false"`
		EnableAutoRedirect   bool     `default:"false"`
		AuthStyle            int      `default:"0"`
		GravatarUrl          string   `default:"https://www.gravatar.com/avatar/%s.jpg"`
		ExpireSSOToken       uint32   `default:"5"`
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
		Bin        string   `default:"/usr/bin/tshark"`
		Param      string   `default:""`
		Protocols  []string `default:""`
		UID        uint32   `default:"0"`
		GID        uint32   `default:"0"`
		ImportNode string   `default:""`
		Enable     bool     `default:"false"`
	}
	//Loki
	LOKI_CONFIG struct {
		User         string `json:"user" mapstructure:"user" default:"admin"`
		Pass         string `json:"pass" mapstructure:"pass" default:""`
		OldStylePass string `json:"password" mapstructure:"password" default:""`
		ParamQuery   string `json:"param_query" mapstructure:"param_query" default:"query_range"`
		Regexp       bool   `json:"regexp" mapstructure:"regexp" default:"false"`
		Host         string `json:"host" mapstructure:"host" default:"http:/127.0.0.1:3100"`
		Template     string `json:"template" mapstructure:"template" default:"{job=\"heplify-server\"}"`
		ExternalUrl  string `json:"external_url" mapstructure:"external_url" default:""`
		Api          string `json:"api" mapstructure:"api" default:"api/v1"`
		Enable       bool   `json:"enable" mapstructure:"enable" default:"false"`
	} `json:"loki_config" mapstructure:"loki_config"`
}
