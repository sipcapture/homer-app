// Homer-App
//
// Homer-App User interface for WEB AI
//
//     Schemes: http, https
//     Host: localhost:9080
//     BasePath: /api/v3
//     Version: 1.1.2
//     License: AGPL https://www.gnu.org/licenses/agpl-3.0.en.html
//	   Copyright: QXIP B.V. 2019-2020
//
//     Consumes:
//     - application/json
//
//     Produces:
//     - application/json
//     Security:
//     - bearer:
//
//     SecurityDefinitions:
//     bearer:
//          type: apiKey
//          name: Authorization
//          in: header
//
// swagger:meta
package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/fsnotify/fsnotify"
	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"

	_ "github.com/influxdata/influxdb1-client" // this is important because of the bug in go mod
	client "github.com/influxdata/influxdb1-client/v2"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/mcuadros/go-defaults"
	uuid "github.com/satori/go.uuid"
	"github.com/sipcapture/homer-app/auth"
	"github.com/sipcapture/homer-app/config"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/migration"
	"github.com/sipcapture/homer-app/migration/jsonschema"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	apirouterv1 "github.com/sipcapture/homer-app/router/v1"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sipcapture/homer-app/utils/httpauth"
	"github.com/sipcapture/homer-app/utils/ldap"
	"github.com/sipcapture/homer-app/utils/logger"
	"github.com/spf13/viper"
	"gopkg.in/go-playground/validator.v9"
)

//CustomValidator function
type CustomValidator struct {
	validator *validator.Validate
}

// validate function
func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

var appFlags CommandLineFlags
var ldapClient ldap.LDAPClient
var authType string
var httpAuth httpauth.Client

type arrayFlags []string

func (i *arrayFlags) String() string {
	return "my string representation"
}

func (i *arrayFlags) Set(value string) error {
	*i = append(*i, value)
	return nil
}

//params for Flags
type CommandLineFlags struct {
	InitializeDB              *bool      `json:"initialize_db"`
	CreateConfigDB            *bool      `json:"create_config_db"`
	CreateDataDB              *bool      `json:"create_data_db"`
	CreateTableConfigDB       *bool      `json:"create_table_config"`
	UpgradeTableConfigDB      *bool      `json:"upgrade_table_config"`
	PopulateTableConfigDB     *bool      `json:"populate_table_config"`
	CreateHomerUser           *bool      `json:"create_homer_user"`
	DeleteHomerUser           *bool      `json:"delete_homer_user"`
	ShowVersion               *bool      `json:"version"`
	ForcePopulate             *bool      `json:"force_insert"`
	ForcePasswordDB           *string    `json:"force_password"`
	UpdateUIUser              *string    `json:"update_ui_user"`
	UpdateUIPassword          *string    `json:"update_ui_password"`
	TablesPopulate            arrayFlags `json:"force_tables"`
	RevokeHomerRole           *bool      `json:"revoke_homer_role"`
	CreateHomerRole           *bool      `json:"create_homer_role"`
	SaveHomerDbConfigToConfig *bool      `json:"save_db_config_to_config"`
	SaveHomerDbDataToConfig   *bool      `json:"save_db_data_to_config"`
	ShowDbUsers               *bool      `json:"show_db_users"`
	ShowHelpMessage           *bool      `json:"help"`
	DatabaseRootUser          *string    `json:"root_user"`
	DatabaseRootPassword      *string    `json:"root_password"`
	DatabaseHost              *string    `json:"root_host"`
	DatabasePort              *int       `json:"root_port"`
	DatabaseRootDB            *string    `json:"root_db"`
	DatabaseSSLMode           *string    `json:"sslmode_db"`
	DatabaseHomerNode         *string    `json:"homer_node"`
	DatabaseHomerUser         *string    `json:"homer_user"`
	DatabaseHomerPassword     *string    `json:"homer_password"`
	DatabaseHomerConfig       *string    `json:"db_homer_config"`
	DatabaseHomerData         *string    `json:"db_homer_data"`
	PathWebAppConfig          *string    `json:"path_webapp"`
	LogPathWebApp             *string    `json:"path_log_webapp"`
	LogName                   *string    `json:"log_name_webapp"`
	APIPrefix                 *string    `json:"api_prefix"`
	WatchConfig               *bool      `json:"watch_config"`
	ShowCurrentConfig         *bool      `json:"show_current_config"`
}

//params for  Services
type ServicesObject struct {
	configDBSession   *gorm.DB
	dataDBSession     map[string]*gorm.DB
	databaseNodeMap   []model.DatabasesMap
	influxDBSession   service.ServiceInfluxDB
	servicePrometheus service.ServicePrometheus
	serviceLoki       service.ServiceLoki
	serviceGrafana    service.ServiceGrafana
	externalDecoder   service.ExternalDecoder
}

var servicesObject ServicesObject

/* init flags */
func initFlags() {
	appFlags.InitializeDB = flag.Bool("initialize_db", false, "initialize the database and create all tables")
	appFlags.CreateConfigDB = flag.Bool("create-config-db", false, "create config db")
	appFlags.CreateDataDB = flag.Bool("create-data-db", false, "create data db")
	appFlags.CreateTableConfigDB = flag.Bool("create-table-db-config", false, "create table in db config")
	appFlags.UpgradeTableConfigDB = flag.Bool("upgrade-table-db-config", false, "upgrade table in db config")

	appFlags.PopulateTableConfigDB = flag.Bool("populate-table-db-config", false, "populate table in db config")

	appFlags.CreateHomerUser = flag.Bool("create-homer-user", false, "create homer user")
	appFlags.DeleteHomerUser = flag.Bool("delete-homer-user", false, "delete homer user")
	appFlags.ShowDbUsers = flag.Bool("show-db-users", false, "show db users")

	appFlags.ForcePopulate = flag.Bool("force-populate", false, "force populate all records to config")
	appFlags.ForcePasswordDB = flag.String("force-password", "", "force password for AWS setups")

	appFlags.UpdateUIUser = flag.String("update-ui-user", "", "update user ui")
	appFlags.UpdateUIPassword = flag.String("update-ui-password", "", "update password for user")

	flag.Var(&appFlags.TablesPopulate, "populate-table", "force to populate only current tables")

	appFlags.ShowVersion = flag.Bool("version", false, "show version")

	appFlags.CreateHomerRole = flag.Bool("create-homer-role", false, "create homer role")
	appFlags.RevokeHomerRole = flag.Bool("revoke-homer-role", false, "revoke homer user")

	appFlags.SaveHomerDbConfigToConfig = flag.Bool("save-homer-db-config-settings", false, "save homer db-config to configs")
	appFlags.SaveHomerDbDataToConfig = flag.Bool("save-homer-db-data-settings", false, "save homer db-data settings to configs")

	appFlags.ShowHelpMessage = flag.Bool("help", false, "show help")
	appFlags.DatabaseRootUser = flag.String("database-root-user", "postgres", "database-root-user")
	appFlags.DatabaseRootPassword = flag.String("database-root-password", "", "database-root-password")
	appFlags.DatabaseHost = flag.String("database-host", "localhost", "database-host")
	appFlags.DatabasePort = flag.Int("database-port", 5432, "database-port")
	appFlags.DatabaseSSLMode = flag.String("database-ssl-mode", "disable", "database-ssl-mode")
	appFlags.DatabaseRootDB = flag.String("database-root-db", "postgres", "database-root-db")
	appFlags.DatabaseHomerNode = flag.String("database-homer-node", "localnode", "database-homer-node")
	appFlags.DatabaseHomerUser = flag.String("database-homer-user", "homer_user", "database-homer-user")
	appFlags.DatabaseHomerPassword = flag.String("database-homer-password", "homer_password", "database-homer-password")
	appFlags.DatabaseHomerConfig = flag.String("database-homer-config", "homer_config", "database-homer-config")
	appFlags.DatabaseHomerData = flag.String("database-homer-data", "homer_data", "database-homer-data")
	appFlags.PathWebAppConfig = flag.String("webapp-config-path", "/usr/local/homer/etc", "the path to the webapp config file")
	appFlags.LogName = flag.String("webapp-log-name", "", "the name prefix of the log file.")
	appFlags.LogPathWebApp = flag.String("webapp-log-path", "", "the path for the log file.")
	appFlags.APIPrefix = flag.String("webapp-api-prefix", "", "API prefix.")
	appFlags.WatchConfig = flag.Bool("watch-config", false, "Watch the configuration for changes")
	appFlags.ShowCurrentConfig = flag.Bool("show-current-config", false, "print out the current config and exit")

	flag.Parse()
}

func main() {

	//init flags
	initFlags()

	/* first check admin flags */
	checkHelpVersionFlags()

	cfg := new(config.HomerSettingServer)
	defaults.SetDefaults(cfg) //<-- This set the defaults values
	config.Setting = *cfg

	// read system configurations and expose through viper
	readConfig()

	configureLogging()

	/* first check admin flags */
	checkAdminFlags()

	/* now check if we do write to config */
	if *appFlags.SaveHomerDbConfigToConfig {
		applyDBConfigParamToConfig(appFlags.DatabaseHomerUser, appFlags.DatabaseHomerPassword,
			appFlags.DatabaseHomerConfig, appFlags.DatabaseHost, appFlags.DatabaseSSLMode)
		os.Exit(0)
	} else if *appFlags.SaveHomerDbDataToConfig {
		applyDBDataParamToConfig(appFlags.DatabaseHomerUser, appFlags.DatabaseHomerPassword, appFlags.DatabaseHomerData,
			appFlags.DatabaseHost, appFlags.DatabaseHomerNode, appFlags.DatabaseSSLMode)
		os.Exit(0)
	}

	servicesObject.configDBSession = getConfigDBSession()
	defer servicesObject.configDBSession.Close()
	nameHomerConfig := viper.GetString("database_config.name")

	if *appFlags.CreateTableConfigDB || *appFlags.UpgradeTableConfigDB {
		migration.CreateHomerConfigTables(servicesObject.configDBSession, nameHomerConfig, *appFlags.UpgradeTableConfigDB, true)
		os.Exit(0)
	} else if *appFlags.PopulateTableConfigDB {
		migration.PopulateHomerConfigTables(servicesObject.configDBSession, nameHomerConfig, *appFlags.ForcePopulate, appFlags.TablesPopulate,
			*appFlags.ForcePasswordDB)
		os.Exit(0)
	}

	if *appFlags.UpdateUIUser != "" && *appFlags.UpdateUIPassword != "" {
		logger.Info(fmt.Sprintf("Updating password for user: [%s]\n", *appFlags.UpdateUIUser))
		migration.UpdateHomerUser(servicesObject.configDBSession, nameHomerConfig, *appFlags.UpdateUIUser, *appFlags.UpdateUIPassword)

		os.Exit(0)
	}

	configureServiceObjects()

	/* force to upgrade */
	if nameHomerConfig := viper.GetString("database_config.name"); nameHomerConfig != "" {
		migration.CreateHomerConfigTables(servicesObject.configDBSession, nameHomerConfig, true, false)
	}

	// update version
	updateVersionApplication(servicesObject.configDBSession)

	if *appFlags.ShowCurrentConfig {
		ShowCurrentConfigToConsole()
		os.Exit(0)
	}

	// configure to serve WebServices
	configureAsHTTPServer()

}

func configureLogging() {

	/* OLD LOG */
	if viper.IsSet("system_settings.logpath") {
		config.Setting.LOG_SETTINGS.Path = viper.GetString("system_settings.logpath")
	}
	if viper.IsSet("system_settings.logname") {
		config.Setting.LOG_SETTINGS.Name = viper.GetString("system_settings.logname")
	}
	if viper.IsSet("system_settings.loglevel") {
		config.Setting.LOG_SETTINGS.Level = viper.GetString("system_settings.loglevel")
	}
	if viper.IsSet("system_settings.logstdout") {
		config.Setting.LOG_SETTINGS.Stdout = viper.GetBool("system_settings.logstdout")
	}
	if viper.IsSet("system_settings.logjson") {
		config.Setting.LOG_SETTINGS.Json = viper.GetBool("system_settings.logjson")
	}
	if viper.IsSet("system_settings.syslog") {
		config.Setting.LOG_SETTINGS.SysLog = viper.GetBool("system_settings.syslog")
	}
	if viper.IsSet("system_settings.syslog_level") {
		config.Setting.LOG_SETTINGS.SysLogLevel = viper.GetString("system_settings.syslog_level")
	}
	if viper.IsSet("system_settings.syslog_uri") {
		config.Setting.LOG_SETTINGS.SyslogUri = viper.GetString("system_settings.syslog_uri")
	}

	if *appFlags.LogPathWebApp != "" {
		config.Setting.LOG_SETTINGS.Path = *appFlags.LogPathWebApp
	} else if config.Setting.LOG_SETTINGS.Path == "" {
		config.Setting.LOG_SETTINGS.Path = "log"
	}

	if *appFlags.LogName != "" {
		config.Setting.LOG_SETTINGS.Name = *appFlags.LogName
	} else if config.Setting.LOG_SETTINGS.Name == "" {
		config.Setting.LOG_SETTINGS.Name = "webapp.log"
	}
	// initialize logger
	logger.InitLogger()
}

func configureServiceObjects() {
	// configure new db session
	servicesObject.dataDBSession, servicesObject.databaseNodeMap = getDataDBSession()
	/* for val := range servicesObject.dataDBSession {
		defer servicesObject.dataDBSession[val].Close()
	}
	*/

	// configure new influx db session
	servicesObject.influxDBSession = getInfluxDBSession()
	/*if servicesObject.influxDBSession.Active {
		defer servicesObject.influxDBSession.InfluxClient.Close()
	}
	*/

	// configure new influx db session
	servicesObject.servicePrometheus = getPrometheusDBSession()
	//defer prometheusService.Close()

	servicesObject.serviceLoki = getRemoteDBSession()
	//defer httpClient.CloseIdleConnections()

	servicesObject.serviceGrafana = getGrafanaSession()

	/***********************************/
	config.Setting.MAIN_SETTINGS.IsolateQuery = viper.GetString("group_settings.isolate_query")
	config.Setting.MAIN_SETTINGS.IsolateGroup = viper.GetString("group_settings.isolate_group")

	/***********************************/
	if viper.IsSet("transaction_settings.deduplicate") {

		if viper.IsSet("transaction_settings.deduplicate.model") {
			config.Setting.TRANSACTION_SETTINGS.DedupModel = viper.GetString("transaction_settings.deduplicate.model")
		}

		if viper.IsSet("transaction_settings.deduplicate.global") {
			config.Setting.TRANSACTION_SETTINGS.GlobalDeduplicate = viper.GetBool("transaction_settings.deduplicate.global")
		}
	}

	/* CaptID alias */
	if viper.IsSet("api_settings.add_captid_to_resolve") {
		config.Setting.MAIN_SETTINGS.UseCaptureIDInAlias = viper.GetBool("api_settings.add_captid_to_resolve")
	}

	/* init map */
	config.OAuth2TokenMap = make(map[string]model.OAuth2MapToken)

	/* oauth2 */
	if viper.IsSet("oauth2.enable") {
		config.Setting.OAUTH2_SETTINGS.Enable = viper.GetBool("oauth2.enable")
	}
	if viper.IsSet("oauth2.client_id") {
		config.Setting.OAUTH2_SETTINGS.ClientID = viper.GetString("oauth2.client_id")
	}
	if viper.IsSet("oauth2.client_secret") {
		config.Setting.OAUTH2_SETTINGS.ClientSecret = viper.GetString("oauth2.client_secret")
	}
	if viper.IsSet("oauth2.project_id") {
		config.Setting.OAUTH2_SETTINGS.ProjectID = viper.GetString("oauth2.project_id")
	}
	if viper.IsSet("oauth2.auth_uri") {
		config.Setting.OAUTH2_SETTINGS.AuthUri = viper.GetString("oauth2.auth_uri")
	}
	if viper.IsSet("oauth2.token_uri") {
		config.Setting.OAUTH2_SETTINGS.TokenUri = viper.GetString("oauth2.token_uri")
	}
	if viper.IsSet("oauth2.auth_provider_x509_cert_url") {
		config.Setting.OAUTH2_SETTINGS.AuthProviderCert = viper.GetString("oauth2.auth_provider_x509_cert_url")
	}
	if viper.IsSet("oauth2.redirect_uri") {
		config.Setting.OAUTH2_SETTINGS.RedirectUri = viper.GetString("oauth2.redirect_uri")
	}
	if viper.IsSet("oauth2.provider_name") {
		config.Setting.OAUTH2_SETTINGS.ServiceProviderName = viper.GetString("oauth2.provider_name")
	}
	if viper.IsSet("oauth2.provider_image") {
		config.Setting.OAUTH2_SETTINGS.ServiceProviderImage = viper.GetString("oauth2.provider_image")
	}
	if viper.IsSet("oauth2.service_redirect") {
		config.Setting.OAUTH2_SETTINGS.UrlToServiceRedirect = viper.GetString("oauth2.service_redirect")
	}
	if viper.IsSet("oauth2.scope") {
		config.Setting.OAUTH2_SETTINGS.Scope = viper.GetStringSlice("oauth2.scope")
	}
	if viper.IsSet("oauth2.state_value") {
		config.Setting.OAUTH2_SETTINGS.StateValue = viper.GetString("oauth2.state_value")
	}
	if viper.IsSet("oauth2.expire_sso") {
		config.Setting.OAUTH2_SETTINGS.ExpireSSOToken = viper.GetUint32("oauth2.expire_sso")
	}
	if viper.IsSet("oauth2.profile_url") {
		config.Setting.OAUTH2_SETTINGS.ProfileURL = viper.GetString("oauth2.profile_url")
	}

	/*********** DASHBOARD *******************/
	if viper.IsSet("dashboard_settings.dashboard_home") {
		config.Setting.DASHBOARD_SETTINGS.ExternalHomeDashboard = viper.GetString("dashboard_settings.dashboard_home")
	}

	/***********************************/
	if viper.IsSet("auth_settings.type") {
		config.Setting.MAIN_SETTINGS.DefaultAuth = viper.GetString("auth_settings.type")
	}

	/* auth settings */
	if viper.IsSet("auth_settings.user_groups") {
		config.Setting.MAIN_SETTINGS.UserGroups = viper.GetStringSlice("auth_settings.user_groups")
	}

	/* check the auth type */
	if config.Setting.MAIN_SETTINGS.DefaultAuth == "" {
		config.Setting.MAIN_SETTINGS.DefaultAuth = "internal"
	}

	if config.Setting.OAUTH2_SETTINGS.Enable {
		config.Setting.MAIN_SETTINGS.OAuth2Config = oauth2.Config{
			ClientID:     config.Setting.OAUTH2_SETTINGS.ClientID,
			ClientSecret: config.Setting.OAUTH2_SETTINGS.ClientSecret,
			Scopes:       config.Setting.OAUTH2_SETTINGS.Scope,
			RedirectURL:  config.Setting.OAUTH2_SETTINGS.RedirectUri + "/" + config.Setting.OAUTH2_SETTINGS.ServiceProviderName,
			Endpoint: oauth2.Endpoint{
				AuthURL:  config.Setting.OAUTH2_SETTINGS.AuthUri,
				TokenURL: config.Setting.OAUTH2_SETTINGS.TokenUri,
			},
		}
	}

	/* Check LDAP here */
	switch config.Setting.MAIN_SETTINGS.DefaultAuth {
	case "ldap":

		defaults.SetDefaults(&ldapClient) //<-- This set the defaults values

		if viper.IsSet("ldap_config.base") {
			ldapClient.Base = viper.GetString("ldap_config.base")
		}
		if viper.IsSet("ldap_config.host") {
			ldapClient.Host = viper.GetString("ldap_config.host")
		}
		if viper.IsSet("ldap_config.port") {
			ldapClient.Port = viper.GetInt("ldap_config.port")
		}

		if viper.IsSet("ldap_config.servername") {
			ldapClient.ServerName = viper.GetString("ldap_config.servername")
		}

		if viper.IsSet("ldap_config.userdn") {
			ldapClient.UserDN = viper.GetString("ldap_config.userdn")
		}

		if viper.IsSet("ldap_config.usessl") {
			ldapClient.UseSSL = viper.GetBool("ldap_config.usessl")
		}

		if viper.IsSet("ldap_config.deref") {
			ldapClient.DerefName = viper.GetString("ldap_config.deref")
			/* lets fix it */
			if ldapClient.DerefName != "" {
				for index, x := range ldap.DerefMap {
					if x == ldapClient.DerefName {
						ldapClient.DerefValue = index
						break
					}
				}
			}
		}

		if viper.IsSet("ldap_config.scope") {
			ldapClient.ScopeName = viper.GetString("ldap_config.scope")
			/* lets fix it */
			if ldapClient.ScopeName != "" {
				for index, x := range ldap.ScopeMap {
					if x == ldapClient.ScopeName {
						ldapClient.ScopeValue = index
						break
					}
				}
			}
		}

		if viper.IsSet("ldap_config.anonymous") {
			ldapClient.Anonymous = viper.GetBool("ldap_config.anonymous")
		}
		if viper.IsSet("ldap_config.binddn") {
			ldapClient.BindDN = viper.GetString("ldap_config.binddn")
		}
		if viper.IsSet("ldap_config.bindpassword") {
			ldapClient.BindPassword = viper.GetString("ldap_config.bindpassword")
		}
		if viper.IsSet("ldap_config.userfilter") {
			ldapClient.UserFilter = viper.GetString("ldap_config.userfilter")
		}
		if viper.IsSet("ldap_config.groupfilter") {
			ldapClient.GroupFilter = viper.GetString("ldap_config.groupfilter")
		}
		if viper.IsSet("ldap_config.attributes") {
			ldapClient.Attributes = viper.GetStringSlice("ldap_config.attributes")
		}
		if viper.IsSet("ldap_config.group_attributes") {
			ldapClient.GroupAttribute = viper.GetStringSlice("ldap_config.group_attributes")
		}
		if viper.IsSet("ldap_config.admingroup") {
			ldapClient.AdminGroup = viper.GetString("ldap_config.admingroup")
		}
		if viper.IsSet("ldap_config.usergroup") {
			ldapClient.UserGroup = viper.GetString("ldap_config.usergroup")
		}
		if viper.IsSet("ldap_config.usermode") {
			ldapClient.UserMode = viper.GetBool("ldap_config.usermode")
		}
		if viper.IsSet("ldap_config.adminmode") {
			ldapClient.AdminMode = viper.GetBool("ldap_config.adminmode")
		}
		if viper.IsSet("ldap_config.searchlimit") {
			ldapClient.SearchLimit = viper.GetInt("ldap_config.searchlimit")
		}
		if viper.IsSet("ldap_config.grouplimit") {
			ldapClient.GroupLimit = viper.GetInt("ldap_config.grouplimit")
		}

		if viper.IsSet("ldap_config.skiptls") {
			ldapClient.SkipTLS = viper.GetBool("ldap_config.skiptls")
		} else {
			if !ldapClient.UseSSL {
				ldapClient.SkipTLS = true
			}
		}

		if viper.IsSet("ldap_config.skipverify") {
			ldapClient.InsecureSkipVerify = viper.GetBool("ldap_config.skipverify")
		} else {
			ldapClient.InsecureSkipVerify = true
		}

		if viper.IsSet("ldap_config.short_group") {
			ldapClient.ShortGroup = viper.GetBool("ldap_config.short_group")
		}

		if viper.IsSet("ldap_config.short_dn_group") {
			ldapClient.ShortDNForGroup = viper.GetBool("ldap_config.short_dn_group")
		}

		if viper.IsSet("ldap_config.nested_group") {
			ldapClient.NestedGroup = viper.GetBool("ldap_config.nested_group")
		}

		if viper.IsSet("ldap_config.UseDNForGroupSearch") {
			ldapClient.UseDNForGroupSearch = viper.GetBool("ldap_config.UseDNForGroupSearch")
		} else {
			ldapClient.UseDNForGroupSearch = true
		}

		defer ldapClient.Close()

	case "http_auth":
		httpAuth.URL = viper.GetString("http_auth.url")
		httpAuth.InsecureSkipVerify = viper.GetBool("skipverify")
	}

	/* apply token expire - default 1200 */
	authTokenExpire := viper.GetInt("auth_settings.token_expire")
	if authTokenExpire > 0 {
		auth.TokenExpiryTime = authTokenExpire
	}

	if versionPg, err := migration.CheckVersion(servicesObject.configDBSession); err != nil {
		heputils.Colorize(heputils.ColorRed, "\r\nVersion of DB couldn't be retrieved\r\n")
	} else if (versionPg / 10000) < jsonschema.MinimumPgSQL {
		heputils.Colorize(heputils.ColorRed, fmt.Sprintf("\r\nYou don't have required version of PostgreSQL. Please install minimum: %d\r\n", jsonschema.MinimumPgSQL))
	} else {
		heputils.Colorize(heputils.ColorBlue, fmt.Sprintf("\r\nPostgreSQL version: %d.%d\r\n", versionPg/10000, versionPg%10000))
	}

}

func configureAsHTTPServer() {

	e := echo.New()
	// add validation
	e.Validator = &CustomValidator{validator: validator.New()}
	// Middleware
	if httpDebugEnable := viper.GetBool("http_settings.debug"); httpDebugEnable {
		e.Use(middleware.Logger())
		e.Use(middleware.Recover())
		e.Use(middleware.BodyDumpWithConfig(middleware.BodyDumpConfig{Skipper: skipper, Handler: bodyDumpHandler}))
	}

	//CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))

	/* hide banner */
	e.HideBanner = true

	if viper.IsSet("grafana_config.host") {
		config.Setting.GRAFANA_SETTINGS.URL = viper.GetString("grafana_config.host")
	}

	if viper.IsSet("grafana_config.path") {
		config.Setting.GRAFANA_SETTINGS.Path = viper.GetString("grafana_config.path")
	}

	if viper.IsSet("grafana_config.token") {
		config.Setting.GRAFANA_SETTINGS.AuthKey = viper.GetString("grafana_config.token")
	}

	// Reverse Proxy
	url1, err := url.Parse(config.Setting.GRAFANA_SETTINGS.URL)
	if err != nil {
		e.Logger.Fatal(err)
	}

	/* target grafana */
	e.Use(GrafanaHeader)

	targets := []*middleware.ProxyTarget{
		{
			URL: url1,
		},
	}

	e.Group(config.Setting.GRAFANA_SETTINGS.Path, middleware.ProxyWithConfig(middleware.ProxyConfig{
		Balancer: middleware.NewRoundRobinBalancer(targets),
		Rewrite: map[string]string{
			config.Setting.GRAFANA_SETTINGS.Path + "/*": "/$1",
		},
	}))

	if config.Setting.SWAGGER.Enable {
		//e.GET("/swagger/*", echoSwagger.WrapHandler)
		e.GET("/doc/api/json", func(c echo.Context) error {

			logger.Debug("Middle swagger ware: ", c.Request().RequestURI)
			dataJson, err := ioutil.ReadFile(config.Setting.SWAGGER.ApiJson)
			if err != nil {
				return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.SwaggerFileNotExistsError)
			}

			newJson := strings.ReplaceAll(string(dataJson), "localhost:9080", config.Setting.SWAGGER.ApiHost)

			return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(newJson))
		})
	}

	/* static */
	rootPath := viper.GetString("http_settings.root")
	if rootPath == "" {
		rootPath = "/usr/local/homer/dist"
	}
	/* static */
	e.Use(middleware.Static(rootPath))

	/* enable guzip*/
	if gzipEnable := viper.GetBool("http_settings.gzip"); gzipEnable {
		e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
			Skipper: func(c echo.Context) bool {
				if strings.HasPrefix(c.Request().RequestURI, "/swagger") {
					return true
				}
				return true
			},
			Level: 5,
		}))
	}

	gzipStaticEnable := true

	if viper.IsSet("http_settings.gzip_static") {
		gzipStaticEnable = viper.GetBool("http_settings.gzip_static")
	}

	if gzipStaticEnable {

		e.Pre(middleware.RewriteWithConfig(middleware.RewriteConfig{
			Skipper: func(c echo.Context) bool {

				if strings.HasSuffix(c.Request().RequestURI, ".js") {
					if heputils.FileExists(rootPath + c.Request().RequestURI + ".gz") {
						c.Response().Header().Set(echo.HeaderContentEncoding, "gzip")
						c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJavaScript)
						return false
					}
				}

				return true
			},
			Rules: map[string]string{
				"*.js": "$1.js.gz",
			},
		}))
	}

	registerGetRedirect(e, rootPath)

	/* decoder */
	servicesObject.externalDecoder.Active = false

	/* old */
	binShark := viper.GetString("decoder_shark.bin")
	if binShark != "" {
		servicesObject.externalDecoder.Binary = binShark
		servicesObject.externalDecoder.Param = viper.GetString("decoder_shark.param")
		servicesObject.externalDecoder.Protocols = viper.GetStringSlice("decoder_shark.protocols")
		servicesObject.externalDecoder.UID = uint32(viper.GetInt("decoder_shark.uid"))
		servicesObject.externalDecoder.GID = uint32(viper.GetInt("decoder_shark.gid"))
		servicesObject.externalDecoder.Active = viper.GetBool("decoder_shark.active")
	}

	//  DECODER - SHARK
	if viper.IsSet("decoder_shark.bin") {
		config.Setting.DECODER_SHARK.Bin = viper.GetString("decoder_shark.bin")
	}

	if viper.IsSet("decoder_shark.param") {
		config.Setting.DECODER_SHARK.Param = viper.GetString("decoder_shark.param")
	}

	if viper.IsSet("decoder_shark.import_node") {
		config.Setting.DECODER_SHARK.ImportNode = viper.GetString("decoder_shark.import_node")
	}

	if viper.IsSet("decoder_shark.protocols") {
		config.Setting.DECODER_SHARK.Protocols = viper.GetStringSlice("decoder_shark.protocols")
	}

	if viper.IsSet("decoder_shark.uid") {
		config.Setting.DECODER_SHARK.UID = uint32(viper.GetInt("decoder_shark.uid"))
	}

	if viper.IsSet("decoder_shark.gid") {
		config.Setting.DECODER_SHARK.GID = uint32(viper.GetInt("decoder_shark.gid"))
	}
	if viper.IsSet("decoder_shark.active") {
		config.Setting.DECODER_SHARK.Enable = viper.GetBool("decoder_shark.active")
	}

	if viper.IsSet("decoder_shark.enable") {
		config.Setting.DECODER_SHARK.Enable = viper.GetBool("decoder_shark.enable")
	}

	if viper.IsSet("swagger.enable") {
		config.Setting.SWAGGER.Enable = viper.GetBool("swagger.enable")
	}

	if viper.IsSet("swagger.api_json") {
		config.Setting.SWAGGER.ApiJson = viper.GetString("swagger.api_json")
	}

	if viper.IsSet("swagger.api_host") {
		config.Setting.SWAGGER.ApiHost = viper.GetString("swagger.api_host")
	}

	// perform routing for v1 version of web apis
	performV1APIRouting(e)
	if viper.GetBool("https_settings.enable") {
		httpsHost := viper.GetString("https_settings.host")
		httpsPort := viper.GetString("https_settings.port")
		httpsURL := fmt.Sprintf("%s:%s", httpsHost, httpsPort)

		httpsCert := viper.GetString("https_settings.cert")
		httpsKey := viper.GetString("https_settings.key")
		heputils.Colorize(heputils.ColorRed, heputils.HomerLogo)
		heputils.Colorize(heputils.ColorGreen, fmt.Sprintf("Version: %s %s", getName(), getVersion()))

		//Doc Swagger for future. For now - external
		/* e.GET("/swagger/*", echoSwagger.WrapHandler)
		 */
		e.Logger.Fatal(e.StartTLS(httpsURL, httpsCert, httpsKey))
	} else {
		httpHost := viper.GetString("http_settings.host")
		httpPort := viper.GetString("http_settings.port")
		httpURL := fmt.Sprintf("%s:%s", httpHost, httpPort)

		heputils.Colorize(heputils.ColorRed, heputils.HomerLogo)
		heputils.Colorize(heputils.ColorGreen, fmt.Sprintf("Version: %s %s", getName(), getVersion()))

		//Doc Swagger for future. For now - external
		/* e.GET("/swagger/*", echoSwagger.WrapHandler)
		 */
		e.Logger.Fatal(e.Start(httpURL))
	}

}

func performV1APIRouting(e *echo.Echo) {

	prefix := *appFlags.APIPrefix

	if viper.IsSet("http_settings.api_prefix") {
		prefix = viper.GetString("http_settings.api_prefix")
	}

	// accessible web services will fall in this group
	acc := e.Group(prefix + "/api/v3")

	switch authType {
	case "ldap":
		apirouterv1.RouteUserApis(acc, servicesObject.configDBSession, &ldapClient, nil)
	case "http_auth":
		apirouterv1.RouteUserApis(acc, servicesObject.configDBSession, nil, &httpAuth)
	default:
		apirouterv1.RouteUserApis(acc, servicesObject.configDBSession, nil, nil)
	}

	//subscribe access with authKey
	apirouterv1.RouteAgentsubAuthKeyApis(acc, servicesObject.configDBSession)

	// route hep_reply apis
	addr := fmt.Sprintf("%s:%d", viper.Get("hep_relay.host"), viper.GetInt("hep_relay.port"))
	apirouterv1.RouteWebSocketApis(acc, addr)

	// restricted web services will fall in this group
	res := e.Group(prefix + "/api/v3")
	// Configure middleware with the custom claims type
	config := middleware.JWTConfig{
		Claims:     &auth.JwtUserClaim{},
		SigningKey: []byte(auth.JwtSecret),
	}

	res.Use(middleware.JWTWithConfig(config))
	res.Use(auth.MiddlewareRes)

	logger.Debug(auth.JwtUserClaim{})

	/*************** admin access ONLY ***************/
	// route mapping apis
	apirouterv1.RouteMappingdApis(res, servicesObject.configDBSession)
	// route alias apis
	apirouterv1.RouteAliasApis(res, servicesObject.configDBSession)
	// route advanced apis
	apirouterv1.RouteAdvancedApis(res, servicesObject.configDBSession)
	// route hepsub apis
	apirouterv1.RouteHepsubApis(res, servicesObject.configDBSession)
	// route make auth token
	apirouterv1.RouteAuthTokenApis(res, servicesObject.configDBSession)

	/*************** PARTLY admin access ONLY ***************/
	// route user apis
	apirouterv1.RouteUserDetailsApis(res, servicesObject.configDBSession)
	// route userSettings apis
	apirouterv1.RouteUserSettingsApis(res, servicesObject.configDBSession)
	// route agent sub apis
	apirouterv1.RouteAgentsubApis(res, servicesObject.configDBSession)

	// route hep sub search apis
	apirouterv1.RouteHepSubSearch(res, servicesObject.configDBSession)

	// route search apis
	apirouterv1.RouteSearchApis(res, servicesObject.dataDBSession, servicesObject.configDBSession, servicesObject.externalDecoder)
	// route dashboards apis
	apirouterv1.RouteDashboardApis(res, servicesObject.configDBSession)

	// route profile apis
	apirouterv1.RouteProfileApis(res, servicesObject.configDBSession, servicesObject.databaseNodeMap)
	// route RouteStatisticApis apis
	apirouterv1.RouteStatisticApis(res, servicesObject.influxDBSession)
	// route RouteStatisticApis apis
	apirouterv1.RoutePrometheusApis(res, servicesObject.servicePrometheus)
	// route RouteLokiApis apis
	apirouterv1.RouteLokiApis(res, servicesObject.serviceLoki)
	// route RouteLokiApis apis
	apirouterv1.RouteGrafanaApis(res, servicesObject.configDBSession, servicesObject.serviceGrafana)

}

/* retries */
func RetryHandler(n int, f func() (bool, error)) error {
	ok, er := f()
	if ok && er == nil {
		return nil
	}
	if n-1 > 0 {
		return RetryHandler(n-1, f)
	}
	return er
}

// getSession creates a new mongo session and panics if connection error occurs
func getDataDBSession() (map[string]*gorm.DB, []model.DatabasesMap) {

	dataConfig := viper.GetStringMapStringSlice("database_data")
	dbMap := make(map[string]*gorm.DB)
	var dbNodeMap []model.DatabasesMap

	if _, ok := dataConfig["user"]; !ok {
		for val := range dataConfig {

			keyData := "database_data." + val

			user := viper.GetString(keyData + ".user")
			password := viper.GetString(keyData + ".pass")
			name := viper.GetString(keyData + ".name")
			host := viper.GetString(keyData + ".host")
			node := viper.GetString(keyData + ".node")
			port := viper.GetInt(keyData + ".port")

			/* keep alive is on by default */
			keepAlive := true
			if viper.IsSet(keyData + ".keepalive") {
				keepAlive = viper.GetBool(keyData + ".keepalive")
			}

			sslMode := "disable"
			if viper.IsSet(keyData + ".sslmode") {
				sslMode = viper.GetString(keyData + ".sslmode")
			} else if viper.IsSet(keyData+".usessl") && viper.GetBool(keyData+".usessl") {
				sslMode = "require"
			}

			logger.Info(fmt.Sprintf("Connecting to [%s, %s, %s, %s, %d, ssl: %s]\n", host, user, name, node, port, sslMode))

			connectString := fmt.Sprintf("host=%s user=%s dbname=%s sslmode=%s password=%s", host, user, name, sslMode, password)

			if port != 0 {
				connectString += fmt.Sprintf(" port=%d", port)
			}

			dbA, err := gorm.Open("postgres", connectString)

			if err != nil {
				logger.Error(fmt.Sprintf("couldn't make connection to [Host: %s, Node: %s, Port: %d]: \n", host, node, port), err)
				continue
			} else {
				dbA.DB().SetMaxIdleConns(5)
				dbA.DB().SetMaxOpenConns(10)
				dbA.DB().SetConnMaxLifetime(5 * time.Minute)
				/* activate logging */
				dbA.SetLogger(&logger.GormLogger{})
				dbMap[val] = dbA

				dbNodeMap = append(dbNodeMap, model.DatabasesMap{Name: node, Value: val})

				if keepAlive {

					go makePingKeepAlive(dbA, host, "data", node)

					// auto-connect，ping per 60s, re-connect on fail or error with intervels 3s, 3s, 15s, 30s, 60s, 60s ...
					/* go func(dbConfig string, db *gorm.DB) {
						var intervals = []time.Duration{3 * time.Second, 3 * time.Second, 15 * time.Second, 30 * time.Second, 60 * time.Second}
						for {
							time.Sleep(60 * time.Second)
							if e := db.DB().Ping(); e != nil {
								logger.Error(fmt.Sprintf("couldn't make ping to [Connect: %s]  Error: [%v]", dbConfig, e))
							L:
								for i := 0; i < len(intervals); i++ {
									e2 := RetryHandler(3, func() (bool, error) {
										var e error
										db, e = gorm.Open("postgres", dbConfig)
										if e != nil {
											logger.Error(fmt.Sprintf("couldn't make connect to [Connect: %s]  Error: [%v]", dbConfig, e))
											return false, e
										}
										return true, nil
									})
									if e2 != nil {
										fmt.Println(e.Error())
										time.Sleep(intervals[i])
										if i == len(intervals)-1 {
											i--
										}
										continue
									}
									break L
								}

							}
						}
					}(connectString, dbA)
					*/
				}

			}

			logger.Info("----------------------------------- ")
			logger.Info("*** Database Data Session created *** ")
			logger.Info("----------------------------------- ")
		}
	} else {
		//single node
		user := viper.GetString("database_data.user")
		password := viper.GetString("database_data.pass")
		name := viper.GetString("database_data.name")
		host := viper.GetString("database_data.host")
		port := viper.GetInt("database_data.port")

		/* keep alive is on by default */
		keepAlive := true
		if viper.IsSet("database_data.keepalive") {
			keepAlive = viper.GetBool("database_data.keepalive")
		}

		logger.Info(fmt.Sprintf("Connecting to the old way: [%s, %s, %s, %d]\n", host, user, name, port))

		sslMode := "disable"
		if viper.IsSet("database_data.sslmode") {
			sslMode = viper.GetString("database_data.sslmode")
		} else if viper.IsSet("database_data.usessl") && viper.GetBool("database_data.usessl") {
			sslMode = "require"
		}

		connectString := fmt.Sprintf("host=%s user=%s dbname=%s sslmode=%s password=%s", host, user, name, sslMode, password)

		if port != 0 {
			connectString += fmt.Sprintf(" port=%d", port)
		}

		db, err := gorm.Open("postgres", connectString)

		db.DB().SetMaxIdleConns(5)
		db.DB().SetMaxOpenConns(10)
		db.DB().SetConnMaxLifetime(5 * time.Minute)
		/* activate logging */
		db.SetLogger(&logger.GormLogger{})

		dbMap["localnode"] = db

		if err != nil {
			logger.Error(err)
			panic("failed to connect database")
		}

		dbNodeMap = append(dbNodeMap, model.DatabasesMap{Value: "localnode", Name: "LocalNode"})

		if keepAlive {
			go makePingKeepAlive(db, host, "data", "localnode")
		}

		logger.Info("----------------------------------- ")
		logger.Info("*** Database Data Session created *** ")
		logger.Info("----------------------------------- ")
	}

	return dbMap, dbNodeMap
}

// getSession creates a new postgres session and panics if connection error occurs
func getConfigDBSession() *gorm.DB {
	user := viper.GetString("database_config.user")
	password := viper.GetString("database_config.pass")
	name := viper.GetString("database_config.name")
	host := viper.GetString("database_config.host")
	port := viper.GetInt("database_config.port")

	/* keep alive is on by default */
	keepAlive := true
	if viper.IsSet("database_config.keepalive") {
		keepAlive = viper.GetBool("database_config.keepalive")
	}

	sslMode := "disable"
	if viper.IsSet("database_config.sslmode") {
		sslMode = viper.GetString("database_config.sslmode")
	} else if viper.IsSet("database_config.usessl") && viper.GetBool("database_config.usessl") {
		sslMode = "require"
	}

	connectString := fmt.Sprintf("host=%s user=%s dbname=%s sslmode=%s password=%s", host, user, name, sslMode, password)

	if port != 0 {
		connectString += fmt.Sprintf(" port=%d", port)
	}

	logger.Info(fmt.Sprintf("Connecting to the config: [%s, %s, %s, %d]\n", host, user, name, port))

	db, err := gorm.Open("postgres", connectString)

	if err != nil {
		logger.Error(err)
		panic("failed to connect database")
	}

	db.DB().SetMaxIdleConns(5)
	db.DB().SetMaxOpenConns(10)
	db.DB().SetConnMaxLifetime(5 * time.Minute)
	db.SetLogger(&logger.GormLogger{})

	logger.Info("----------------------------------- ")
	logger.Info("*** Database Config Session created *** ")
	logger.Info("----------------------------------- ")

	if keepAlive {
		go makePingKeepAlive(db, host, "config", "localnode")
	}

	return db
}

// getSession creates a new mongo session and panics if connection error occurs
func updateVersionApplication(configDBSession *gorm.DB) bool {

	var err error
	var saveConfig = false
	recordApp := model.TableApplications{}
	recordApp.VersionApplication = getVersion()
	recordApp.NameApplication = getName()

	recordApp.HostApplication = viper.GetString("system_settings.hostname")
	if recordApp.HostApplication == "" {
		recordApp.HostApplication, err = os.Hostname()
		if err != nil {
			recordApp.HostApplication = "unknown"
		}
		viper.Set("system_settings.hostname", recordApp.HostApplication)
		saveConfig = true

	}

	recordApp.GUID = viper.GetString("system_settings.uuid")
	if recordApp.GUID == "" {
		recordApp.GUID = uuid.NewV4().String()
		viper.Set("system_settings.uuid", recordApp.GUID)
		saveConfig = true
	}

	if saveConfig {
		err := viper.WriteConfig()
		if err != nil {
			fmt.Println("No configuration file loaded: ", err)
			logger.Error("No configuration file loaded - using defaults")
			return false
		}
	}

	if err := configDBSession.Debug().Set(
		"gorm:insert_option",
		fmt.Sprintf("ON CONFLICT (name,host) DO UPDATE SET version = EXCLUDED.version, guid = EXCLUDED.guid"),
	).Table("applications").Create(&recordApp).Error; err != nil {
		logger.Error("Error by updating application table", err)
		return false
	}

	return true
}

// getInfluxDBSession creates a new influxdb session and panics if connection error occurs
func getInfluxDBSession() service.ServiceInfluxDB {

	user := viper.GetString("influxdb_config.user")
	password := viper.GetString("influxdb_config.pass")
	host := viper.GetString("influxdb_config.host")

	if host == "" {
		logger.Info("InfluxDB functions disabled")
		return service.ServiceInfluxDB{Active: false}
	}

	urlInflux, err := url.Parse(host)
	if err != nil {
		logger.Error(err)
		panic("failed to parse influx host")
	}

	conf := client.HTTPConfig{
		Addr:     urlInflux.String(),
		Username: user,
		Password: password,
	}

	influxClient, err := client.NewHTTPClient(conf)
	if err != nil {
		logger.Error(err)
		panic("failed to connect influx database")
	}

	serviceInfluxDB := service.ServiceInfluxDB{
		InfluxClient: influxClient,
		Active:       true,
	}

	logger.Info("----------------------------------- ")
	logger.Info("*** Influx Database Session created *** ")
	logger.Info("----------------------------------- ")
	return serviceInfluxDB
}

// getPrometheusDBSession creates a new influxdb session and panics if connection error occurs
func getPrometheusDBSession() service.ServicePrometheus {

	host := viper.GetString("prometheus_config.host")
	user := viper.GetString("prometheus_config.user")
	password := viper.GetString("prometheus_config.pass")
	api := viper.GetString("prometheus_config.api")

	if host == "" {
		logger.Info("Prometheus functions disabled")
		return service.ServicePrometheus{Active: false}
	}

	httpClient := &http.Client{
		Timeout: time.Second * 10,
	}

	servicePrometheus := service.ServicePrometheus{
		HttpClient: httpClient,
		User:       user,
		Password:   password,
		Host:       host,
		Api:        api,
		Active:     true,
	}

	logger.Info("------------------------------------ ")
	logger.Info("**** Prometheus Session created **** ")
	logger.Info("------------------------------------ ")
	return servicePrometheus
}

// getInfluxDBSession creates a new influxdb session and panics if connection error occurs
func getRemoteDBSession() service.ServiceLoki {

	user := viper.GetString("loki_config.user")
	password := viper.GetString("loki_config.pass")
	if viper.IsSet("loki_config.password") {
		password = viper.GetString("loki_config.password")
	}

	host := viper.GetString("loki_config.host")
	api := viper.GetString("loki_config.api")
	paramQuery := viper.GetString("loki_config.param_query")

	if host == "" {
		logger.Info("Loki functions disabled")
		return service.ServiceLoki{Active: false}
	}

	/* if the param_query has been not defined - we use the new schema */
	if paramQuery == "" {
		paramQuery = "query_range"
	}
	/* force to new api*/
	if api == "" || api == "api/prom" {
		api = "loki/api/v1"
	}

	httpClient := &http.Client{
		Timeout: time.Second * 10,
	}

	ServiceLoki := service.ServiceLoki{
		HttpClient: httpClient,
		User:       user,
		Password:   password,
		Host:       host,
		Api:        api,
		ParamQuery: paramQuery,
		Active:     true,
	}

	logger.Info("------------------------------------ ")
	logger.Info("**** Loki Session created **** ")
	logger.Info("------------------------------------ ")
	return ServiceLoki
}

// getInfluxDBSession creates a new influxdb session and panics if connection error occurs
func getGrafanaSession() service.ServiceGrafana {

	httpClient := &http.Client{
		Timeout: time.Second * 10,
	}

	ServiceGrafana := service.ServiceGrafana{
		HttpClient: httpClient,
		User:       "admin",
		Password:   "",
		Token:      "",
		Host:       "http://127.0.0.1:3000",
		Api:        "",
		Active:     true,
	}

	return ServiceGrafana
}

func readConfig() {
	// Getting constant values
	if configEnv := os.Getenv("WEBAPPENV"); configEnv != "" {
		viper.SetConfigName("webapp_config_" + configEnv)
	} else {
		viper.SetConfigName("webapp_config")
	}
	viper.SetConfigType("json")

	if configPath := os.Getenv("WEBAPPPATH"); configPath != "" {
		viper.AddConfigPath(configPath)
	} else {
		viper.AddConfigPath(*appFlags.PathWebAppConfig)
	}
	err := viper.ReadInConfig()
	if err != nil {
		fmt.Println("No configuration file loaded: ", err)
		logger.Error("No configuration file loaded - using defaults")
		panic("DB configuration file not found: ")
	}
	if *appFlags.WatchConfig {
		viper.OnConfigChange(func(in fsnotify.Event) {
			configureLogging()
			configureServiceObjects()

		})
		viper.WatchConfig()
	}
}

func applyDBDataParamToConfig(user *string, password *string, dbname *string, host *string, node *string, sslmode *string) {

	createString := fmt.Sprintf("\r\nHOMER - writing data to config [user=%s password=%s, dbname=%s, host=%s, node=%s, sslmode=%s]", *user, *password, *dbname, *host, *node, *sslmode)

	heputils.Colorize(heputils.ColorRed, createString)

	viper.Set("database_data."+*node+".user", *user)
	viper.Set("database_data."+*node+".pass", *password)
	viper.Set("database_data."+*node+".name", *dbname)
	viper.Set("database_data."+*node+".host", *host)
	viper.Set("database_data."+*node+".node", *node)
	viper.Set("database_data."+*node+".sslmode", *sslmode)

	err := viper.WriteConfig()
	if err != nil {
		fmt.Println("No configuration file loaded: ", err)
		logger.Error("No configuration file loaded - using defaults")
		panic("DB configuration file not found: ")
	}
}

func applyDBConfigParamToConfig(user *string, password *string, dbname *string, host *string, sslmode *string) {

	createString := fmt.Sprintf("\r\nHOMER - writing data to config [user=%s password=%s, dbname=%s, host=%s, sslmode=%s]", *user, *password, *dbname, *host, *sslmode)

	heputils.Colorize(heputils.ColorRed, createString)

	viper.Set("database_config.user", *user)
	viper.Set("database_config.pass", *password)
	viper.Set("database_config.name", *dbname)
	viper.Set("database_config.host", *host)
	viper.Set("database_config.sslmode", *sslmode)

	err := viper.WriteConfig()
	if err != nil {
		fmt.Println("No configuration file loaded: ", err)
		logger.Error("No configuration file loaded - using defaults")
		panic("DB configuration file not found: ")
	}
}

func registerGetRedirect(e *echo.Echo, path string) {

	prefix := *appFlags.APIPrefix

	if viper.IsSet("http_settings.api_prefix") {
		prefix = viper.GetString("http_settings.api_prefix")
	}

	e.GET(prefix+"/dashboard/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET(prefix+"/call/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET(prefix+"/call/:name/", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET(prefix+"/search/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET(prefix+"/search/:name/", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET(prefix+"/registration/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET(prefix+"/registration/:name/", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET(prefix+"(system:login)", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET(prefix+"/preference/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/transaction/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/search/result/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/search/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

}

// middle ware handler
func bodyDumpHandler(c echo.Context, reqBody, resBody []byte) {

	logger.Debug("================================")

	logger.Debug("--------request body-------")
	printBody(reqBody)
	logger.Info("---------------------------")

	logger.Debug("-------- response body --------")
	printBody(resBody)
	logger.Debug("-------------------------------")
	logger.Debug("=================================")
}

// body dump skipper
func skipper(c echo.Context) bool {

	if c.Request().Method == "POST" {
		logger.Debug(c.Request().URL.Path)
		return true
	}

	return false
}

// private method
func printBody(obj []byte) {

	logger.Logger.WithFields(logrus.Fields{
		"json": string(obj),
	}).Info("Payload")
}

func checkHelpVersionFlags() {
	if *appFlags.ShowHelpMessage {
		flag.Usage()
		os.Exit(0)
	}

	if *appFlags.ShowVersion {
		fmt.Printf("VERSION: %s\r\n", getVersion())
		os.Exit(0)
	}
}

func checkAdminFlags() {
	if *appFlags.InitializeDB {
		initDB()
	}

	/* start creating pgsql user */
	if *appFlags.CreateHomerUser {

		rootDb, err := migration.GetDataRootDBSession(appFlags.DatabaseRootUser,
			appFlags.DatabaseRootPassword,
			appFlags.DatabaseRootDB,
			appFlags.DatabaseHost,
			appFlags.DatabasePort,
			appFlags.DatabaseSSLMode)

		if err != nil {
			logger.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logger.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
			panic(err)
		}

		defer rootDb.Close()

		migration.CreateNewUser(rootDb, appFlags.DatabaseHomerUser, appFlags.DatabaseHomerPassword)
		migration.ShowUsers(rootDb)

		os.Exit(0)
		/* start drop pgsql user */
	} else if *appFlags.DeleteHomerUser {

		rootDb, err := migration.GetDataRootDBSession(appFlags.DatabaseRootUser,
			appFlags.DatabaseRootPassword,
			appFlags.DatabaseRootDB,
			appFlags.DatabaseHost,
			appFlags.DatabasePort,
			appFlags.DatabaseSSLMode)

		if err != nil {
			logger.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logger.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
			panic(err)
		}

		defer rootDb.Close()

		migration.DeleteNewUser(rootDb, appFlags.DatabaseHomerUser)
		migration.ShowUsers(rootDb)

		os.Exit(0)
		/* start creating pgsql user */
	} else if *appFlags.CreateConfigDB || *appFlags.CreateDataDB {

		rootDb, err := migration.GetDataRootDBSession(appFlags.DatabaseRootUser,
			appFlags.DatabaseRootPassword,
			appFlags.DatabaseRootDB,
			appFlags.DatabaseHost,
			appFlags.DatabasePort,
			appFlags.DatabaseSSLMode)

		if err != nil {
			logger.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logger.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
			panic(err)
		}

		defer rootDb.Close()
		if *appFlags.CreateDataDB {
			migration.CreateHomerDB(rootDb, appFlags.DatabaseHomerData, appFlags.DatabaseHomerUser)
		} else {
			migration.CreateHomerDB(rootDb, appFlags.DatabaseHomerConfig, appFlags.DatabaseHomerUser)
		}

		migration.ShowUsers(rootDb)

		os.Exit(0)
		/* start creating pgsql user */
	} else if *appFlags.CreateHomerRole {

		rootDb, err := migration.GetDataRootDBSession(appFlags.DatabaseRootUser,
			appFlags.DatabaseRootPassword,
			appFlags.DatabaseRootDB,
			appFlags.DatabaseHost,
			appFlags.DatabasePort,
			appFlags.DatabaseSSLMode)

		if err != nil {
			logger.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logger.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
			panic(err)
		}

		defer rootDb.Close()

		dataDb, err := migration.GetDataRootDBSession(appFlags.DatabaseRootUser,
			appFlags.DatabaseRootPassword,
			appFlags.DatabaseHomerData,
			appFlags.DatabaseHost,
			appFlags.DatabasePort,
			appFlags.DatabaseSSLMode)

		if err != nil {
			logger.Error("Couldn't establish connection to data. Please be sure you can have correct password", err)
			logger.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
			panic(err)
		}

		defer dataDb.Close()

		migration.CreateHomerRole(rootDb, dataDb, appFlags.DatabaseHomerUser, appFlags.DatabaseHomerConfig, appFlags.DatabaseHomerData)
		migration.ShowUsers(rootDb)

		os.Exit(0)
	} else if *appFlags.RevokeHomerRole {

		rootDb, err := migration.GetDataRootDBSession(appFlags.DatabaseRootUser,
			appFlags.DatabaseRootPassword,
			appFlags.DatabaseRootDB,
			appFlags.DatabaseHost,
			appFlags.DatabasePort,
			appFlags.DatabaseSSLMode)

		if err != nil {
			logger.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logger.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
			panic(err)
		}

		defer rootDb.Close()

		migration.RevokeHomerRole(rootDb, appFlags.DatabaseHomerUser, appFlags.DatabaseHomerConfig, appFlags.DatabaseHomerData)
		migration.ShowUsers(rootDb)

		os.Exit(0)
		/* start drop pgsql user */
		/* start drop pgsql user */
	} else if *appFlags.ShowDbUsers {

		rootDb, err := migration.GetDataRootDBSession(appFlags.DatabaseRootUser,
			appFlags.DatabaseRootPassword,
			appFlags.DatabaseRootDB,
			appFlags.DatabaseHost,
			appFlags.DatabasePort,
			appFlags.DatabaseSSLMode)

		if err != nil {
			logger.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logger.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
			panic(err)
		}

		defer rootDb.Close()

		migration.ShowUsers(rootDb)

		os.Exit(0)
	}
}

func initDB() {
	rootDb, err := migration.GetDataRootDBSession(
		appFlags.DatabaseRootUser,
		appFlags.DatabaseRootPassword,
		appFlags.DatabaseRootDB,
		appFlags.DatabaseHost,
		appFlags.DatabasePort,
		appFlags.DatabaseSSLMode)

	if err != nil {
		logger.Error("Couldn't establish connection. Please be sure you can have correct password", err)
		logger.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
		panic(err)
	}

	defer rootDb.Close()

	migration.CreateNewUser(rootDb, appFlags.DatabaseHomerUser, appFlags.DatabaseHomerPassword)
	migration.ShowUsers(rootDb)

	migration.CreateHomerDB(rootDb, appFlags.DatabaseHomerData, appFlags.DatabaseHomerUser)
	migration.CreateHomerDB(rootDb, appFlags.DatabaseHomerConfig, appFlags.DatabaseHomerUser)

	databaseDb, err := migration.GetDataRootDBSession(
		appFlags.DatabaseRootUser,
		appFlags.DatabaseRootPassword,
		appFlags.DatabaseHomerData,
		appFlags.DatabaseHost,
		appFlags.DatabasePort,
		appFlags.DatabaseSSLMode)

	if err != nil {
		logger.Error("Couldn't establish connection to databaseDb. Please be sure you can have correct password", err)
		logger.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
		panic(err)
	}

	defer databaseDb.Close()

	migration.CreateHomerRole(rootDb, databaseDb, appFlags.DatabaseHomerUser, appFlags.DatabaseHomerConfig, appFlags.DatabaseHomerData)

	servicesObject.configDBSession = getConfigDBSession()
	defer servicesObject.configDBSession.Close()
	nameHomerConfig := viper.GetString("database_config.name")

	migration.CreateHomerConfigTables(servicesObject.configDBSession, nameHomerConfig, *appFlags.UpgradeTableConfigDB, true)
	migration.PopulateHomerConfigTables(servicesObject.configDBSession, nameHomerConfig, *appFlags.ForcePopulate, appFlags.TablesPopulate, *appFlags.ForcePasswordDB)

	os.Exit(0)
}

// ServerHeader middleware adds a `Server` header to the response.
func GrafanaHeader(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if strings.HasPrefix(c.Request().RequestURI, config.Setting.GRAFANA_SETTINGS.Path) {
			c.Request().Header.Add("Authorization", "Bearer "+config.Setting.GRAFANA_SETTINGS.AuthKey)
		}
		return next(c)
	}
}

// make a ping keep alive
func makePingKeepAlive(db *gorm.DB, host string, typeData string, node string) {

	for {

		pingErr := db.DB().Ping()
		if pingErr != nil {
			logger.Error(fmt.Sprintf("couldn't make ping to [Host: %s], Type: [%s], Node: [%s]  Error: [%v]",
				host, typeData, node, pingErr))
		} else {
			logger.Debug(fmt.Printf("Successful ping: %s, Type: %s, Node: %s", host, typeData, node))
		}

		time.Sleep(time.Duration(60) * time.Second)
	}
}

func ShowCurrentConfigToConsole() {

	heputils.Colorize(heputils.ColorRed, "\r\nMAIN_SETTINGS:\r\n")

	spew.Dump(config.Setting)

	heputils.Colorize(heputils.ColorRed, "\r\nLDAP:\r\n")

	spew.Dump(ldapClient)

}
