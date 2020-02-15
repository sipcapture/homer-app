// Homer-App
//
// Homer-App User interface for WEB AI
//
//     Schemes: http
//     Host: localhost:9080
//     BasePath: /api/v3
//     Version: 1.1.2
//     License: AGPL https://www.gnu.org/licenses/agpl-3.0.en.html
//	   Copyright: QXIP B.V. 2019-2020
//     Contact: Aqs <aqsyounas@gmail.com>
//     Contact: Alexandr Dubovikov <alexandr.dubovikov@gmail.com>
//
//     Consumes:
//     - application/json
//
//     Produces:
//     - application/json
//     Security:
//     - bearer
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
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	_ "github.com/influxdata/influxdb1-client" // this is important because of the bug in go mod
	client "github.com/influxdata/influxdb1-client/v2"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	uuid "github.com/satori/go.uuid"
	"github.com/sipcapture/homer-app/auth"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/migration"
	"github.com/sipcapture/homer-app/migration/jsonschema"
	"github.com/sipcapture/homer-app/model"
	apirouterv1 "github.com/sipcapture/homer-app/router/v1"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sipcapture/homer-app/utils/ldap"
	"github.com/sipcapture/homer-app/utils/logger"
	"github.com/sirupsen/logrus"
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
	DatabaseHomerNode         *string    `json:"homer_node"`
	DatabaseHomerUser         *string    `json:"homer_user"`
	DatabaseHomerPassword     *string    `json:"homer_password"`
	DatabaseHomerConfig       *string    `json:"db_homer_config"`
	DatabaseHomerData         *string    `json:"db_homer_data"`
	PathWebAppConfig          *string    `json:"path_webapp"`
	LogPathWebApp             *string    `json:"path_log_webapp"`
	LogName                   *string    `json:"log_name_webapp"`
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
	appFlags.DatabaseRootDB = flag.String("database-root-db", "postgres", "database-root-db")
	appFlags.DatabaseHomerNode = flag.String("database-homer-node", "localnode", "database-homer-node")
	appFlags.DatabaseHomerUser = flag.String("database-homer-user", "homer_user", "database-homer-user")
	appFlags.DatabaseHomerPassword = flag.String("database-homer-password", "homer_password", "database-homer-password")
	appFlags.DatabaseHomerConfig = flag.String("database-homer-config", "homer_config", "database-homer-config")
	appFlags.DatabaseHomerData = flag.String("database-homer-data", "homer_data", "database-homer-data")

	appFlags.PathWebAppConfig = flag.String("webapp-config-path", "/usr/local/homer/etc", "the path to the webapp config file")
	appFlags.LogName = flag.String("webapp-log-name", "", "the name prefix of the log file.")
	appFlags.LogPathWebApp = flag.String("webapp-log-path", "", "the path for the log file.")

	flag.Parse()
}

func main() {

	//init flags
	initFlags()

	/* first check admin flags */
	checkHelpVersionFlags()

	// read system configurations and expose through viper
	readConfig()

	logPath := viper.GetString("system_settings.logpath")
	logName := viper.GetString("system_settings.logname")
	logLevel := viper.GetString("system_settings.loglevel")
	logStdout := viper.GetBool("system_settings.logstdout")

	if *appFlags.LogPathWebApp != "" {
		logPath = *appFlags.LogPathWebApp
	} else if logPath == "" {
		logPath = "log"
	}

	if *appFlags.LogName != "" {
		logName = *appFlags.LogName
	} else if logPath == "" {
		logName = "webapp.log"
	}

	// initialize logger
	logger.InitLogger(logPath, logName, logLevel, logStdout)

	/* first check admin flags */
	checkAdminFlags()

	/* now check if we do write to config */
	if *appFlags.SaveHomerDbConfigToConfig {
		applyDBDataParamToConfig(appFlags.DatabaseHomerUser, appFlags.DatabaseHomerPassword, appFlags.DatabaseHomerConfig, appFlags.DatabaseHost, appFlags.DatabaseHomerNode)
		os.Exit(0)
	} else if *appFlags.SaveHomerDbDataToConfig {
		applyDBConfigParamToConfig(appFlags.DatabaseHomerUser, appFlags.DatabaseHomerPassword, appFlags.DatabaseHomerData, appFlags.DatabaseHost)
		os.Exit(0)
	}

	servicesObject.configDBSession = getConfigDBSession()
	defer servicesObject.configDBSession.Close()

	if *appFlags.CreateTableConfigDB || *appFlags.UpgradeTableConfigDB {
		nameHomerConfig := viper.GetString("database_config.name")
		migration.CreateHomerConfigTables(servicesObject.configDBSession, nameHomerConfig, *appFlags.UpgradeTableConfigDB, true)
		os.Exit(0)
	} else if *appFlags.PopulateTableConfigDB {

		nameHomerConfig := viper.GetString("database_config.name")
		migration.PopulateHomerConfigTables(servicesObject.configDBSession, nameHomerConfig, *appFlags.ForcePopulate, appFlags.TablesPopulate)

		os.Exit(0)
	}

	// configure new db session
	servicesObject.dataDBSession, servicesObject.databaseNodeMap = getDataDBSession()
	for val := range servicesObject.dataDBSession {
		defer servicesObject.dataDBSession[val].Close()
	}

	// configure new influx db session
	servicesObject.influxDBSession = getInfluxDBSession()
	if servicesObject.influxDBSession.Active {
		defer servicesObject.influxDBSession.InfluxClient.Close()
	}

	// configure new influx db session
	servicesObject.servicePrometheus = getPrometheusDBSession()
	//defer prometheusService.Close()

	servicesObject.serviceLoki = getRemoteDBSession()
	//defer httpClient.CloseIdleConnections()

	servicesObject.serviceGrafana = getGrafanaSession()

	authType = viper.GetString("auth_settings.type")
	/* check the auth type */
	if authType == "" {
		authType = "internal"
	}

	/* Check LDAP here */
	if authType == "ldap" {
		logrus.Println("Ldap implementation here")
		ldapClient.Base = viper.GetString("ldap_config.base")
		ldapClient.Host = viper.GetString("ldap_config.host")
		ldapClient.Port = viper.GetInt("ldap_config.port")
		ldapClient.UseSSL = viper.GetBool("ldap_config.usessl")
		ldapClient.Anonymous = viper.GetBool("ldap_config.anonymous")
		ldapClient.UserDN = viper.GetString("ldap_config.userdn")
		ldapClient.BindDN = viper.GetString("ldap_config.binddn")
		ldapClient.BindPassword = viper.GetString("ldap_config.bindpassword")
		ldapClient.UserFilter = viper.GetString("ldap_config.userfilter")
		ldapClient.GroupFilter = viper.GetString("ldap_config.groupfilter")
		ldapClient.Attributes = viper.GetStringSlice("ldap_config.attributes")
		ldapClient.AdminGroup = viper.GetString("ldap_config.admingroup")
		ldapClient.AdminMode = viper.GetBool("ldap_config.adminmode")

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

		defer ldapClient.Close()
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

	/* force to upgrade */
	if nameHomerConfig := viper.GetString("database_config.name"); nameHomerConfig != "" {
		migration.CreateHomerConfigTables(servicesObject.configDBSession, nameHomerConfig, true, false)
	}

	// update version
	updateVersionApplication(servicesObject.configDBSession)

	// configure to serve WebServices
	configureAsHTTPServer()

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

	/* hide bunner */
	e.HideBanner = true

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

	binShark := viper.GetString("decoder_shark.bin")
	if binShark != "" {
		servicesObject.externalDecoder.Binary = binShark
		servicesObject.externalDecoder.Param = viper.GetString("decoder_shark.param")
		servicesObject.externalDecoder.Protocols = viper.GetStringSlice("decoder_shark.protocols")
		servicesObject.externalDecoder.UID = uint32(viper.GetInt("decoder_shark.uid"))
		servicesObject.externalDecoder.GID = uint32(viper.GetInt("decoder_shark.gid"))
		servicesObject.externalDecoder.Active = viper.GetBool("decoder_shark.active")
	}

	// perform routing for v1 version of web apis
	performV1APIRouting(e)
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

func performV1APIRouting(e *echo.Echo) {

	// accessible web services will fall in this group
	acc := e.Group("/api/v3")

	if authType == "ldap" {
		apirouterv1.RouteUserApis(acc, servicesObject.configDBSession, &ldapClient)
	} else {
		apirouterv1.RouteUserApis(acc, servicesObject.configDBSession, nil)
	}

	//subscribe access with authKey
	apirouterv1.RouteAgentsubAuthKeyApis(acc, servicesObject.configDBSession)

	// restricted web services will fall in this group
	res := e.Group("/api/v3")
	// Configure middleware with the custom claims type
	config := middleware.JWTConfig{
		Claims:     &auth.JwtUserClaim{},
		SigningKey: []byte(auth.JwtSecret),
	}

	res.Use(middleware.JWTWithConfig(config))
	res.Use(auth.MiddlewareRes)

	logrus.Debug(auth.JwtUserClaim{})

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

			logrus.Println(fmt.Sprintf("Connecting to [%s, %s, %s, %s]\n", host, user, name, node))

			db, err := gorm.Open("postgres", "host="+host+" user="+user+" dbname="+name+" sslmode=disable password="+password)

			if err != nil {
				logrus.Error(fmt.Sprintf("couldn't make connection to [Host: %s, Node: %s]: \n", host, node), err)
				continue
			} else {
				/* activate logging */
				db.SetLogger(&logger.GormLogger{})
				dbMap[val] = db
				dbNodeMap = append(dbNodeMap, model.DatabasesMap{Name: node, Value: val})

			}

			logrus.Println("----------------------------------- ")
			logrus.Println("*** Database Config Session created *** ")
			logrus.Println("----------------------------------- ")
		}
	} else {
		//single node
		user := viper.GetString("database_data.user")
		password := viper.GetString("database_data.pass")
		name := viper.GetString("database_data.name")
		host := viper.GetString("database_data.host")

		logrus.Println(fmt.Sprintf("Connecting to the old way: [%s, %s, %s]\n", host, user, name))

		db, err := gorm.Open("postgres", "host="+host+" user="+user+" dbname="+name+" sslmode=disable password="+password)

		/* activate logging */
		db.SetLogger(&logger.GormLogger{})

		dbMap["localnode"] = db

		if err != nil {
			logrus.Error(err)
			panic("failed to connect database")
		}

		dbNodeMap = append(dbNodeMap, model.DatabasesMap{Value: "localnode", Name: "LocalNode"})

		logrus.Println("----------------------------------- ")
		logrus.Println("*** Database Data Session created *** ")
		logrus.Println("----------------------------------- ")
	}

	return dbMap, dbNodeMap
}

// getSession creates a new mongo session and panics if connection error occurs
func getConfigDBSession() *gorm.DB {
	user := viper.GetString("database_config.user")
	password := viper.GetString("database_config.pass")
	name := viper.GetString("database_config.name")
	host := viper.GetString("database_config.host")

	db, err := gorm.Open("postgres", "host="+host+" user="+user+" dbname="+name+" sslmode=disable password="+password)

	if err != nil {
		logrus.Error(err)
		panic("failed to connect database")
	}

	db.SetLogger(&logger.GormLogger{})

	logrus.Println("----------------------------------- ")
	logrus.Println("*** Database Config Session created *** ")
	logrus.Println("----------------------------------- ")

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
			logrus.Errorln("No configuration file loaded - using defaults")
			return false
		}
	}

	if err := configDBSession.Debug().Set(
		"gorm:insert_option",
		fmt.Sprintf("ON CONFLICT (name,host) DO UPDATE SET version = EXCLUDED.version, guid = EXCLUDED.guid"),
	).Table("applications").Create(&recordApp).Error; err != nil {
		logrus.Error("Error by updating application table", err)
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
		logrus.Println("InfluxDB functions disabled")
		return service.ServiceInfluxDB{Active: false}
	}

	urlInflux, err := url.Parse(host)
	if err != nil {
		logrus.Error(err)
		panic("failed to parse influx host")
	}

	conf := client.HTTPConfig{
		Addr:     urlInflux.String(),
		Username: user,
		Password: password,
	}

	influxClient, err := client.NewHTTPClient(conf)
	if err != nil {
		logrus.Error(err)
		panic("failed to connect influx database")
	}

	serviceInfluxDB := service.ServiceInfluxDB{
		InfluxClient: influxClient,
		Active:       true,
	}

	logrus.Println("----------------------------------- ")
	logrus.Println("*** Influx Database Session created *** ")
	logrus.Println("----------------------------------- ")
	return serviceInfluxDB
}

// getPrometheusDBSession creates a new influxdb session and panics if connection error occurs
func getPrometheusDBSession() service.ServicePrometheus {

	host := viper.GetString("prometheus_config.host")
	user := viper.GetString("prometheus_config.user")
	password := viper.GetString("prometheus_config.pass")
	api := viper.GetString("prometheus_config.api")

	if host == "" {
		logrus.Println("Prometheus functions disabled")
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

	logrus.Println("------------------------------------ ")
	logrus.Println("**** Prometheus Session created **** ")
	logrus.Println("------------------------------------ ")
	return servicePrometheus
}

// getInfluxDBSession creates a new influxdb session and panics if connection error occurs
func getRemoteDBSession() service.ServiceLoki {

	user := viper.GetString("loki_config.user")
	password := viper.GetString("loki_config.pass")
	host := viper.GetString("loki_config.host")
	api := viper.GetString("loki_config.api")
	paramQuery := viper.GetString("loki_config.param_query")

	if host == "" {
		logrus.Println("Loki functions disabled")
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

	logrus.Println("------------------------------------ ")
	logrus.Println("**** Loki Session created **** ")
	logrus.Println("------------------------------------ ")
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
		logrus.Errorln("No configuration file loaded - using defaults")
		panic("DB configuration file not found: ")
	}
}

func applyDBDataParamToConfig(user *string, password *string, dbname *string, host *string, node *string) {

	createString := fmt.Sprintf("\r\nHOMER - writing data to config [user=%s password=%s, dbname=%s, host=%s, node=%s]", *user, *password, *dbname, *host, *node)

	heputils.Colorize(heputils.ColorRed, createString)

	viper.Set("database_data."+*node+".user", *user)
	viper.Set("database_data."+*node+".pass", *password)
	viper.Set("database_data."+*node+".name", *dbname)
	viper.Set("database_data."+*node+".host", *host)
	viper.Set("database_data."+*node+".node", *node)

	err := viper.WriteConfig()
	if err != nil {
		fmt.Println("No configuration file loaded: ", err)
		logrus.Errorln("No configuration file loaded - using defaults")
		panic("DB configuration file not found: ")
	}
}

func applyDBConfigParamToConfig(user *string, password *string, dbname *string, host *string) {

	createString := fmt.Sprintf("\r\nHOMER - writing data to config [user=%s password=%s, dbname=%s, host=%s]", *user, *password, *dbname, *host)

	heputils.Colorize(heputils.ColorRed, createString)

	viper.Set("database_config.user", *user)
	viper.Set("database_config.pass", *password)
	viper.Set("database_config.name", *dbname)
	viper.Set("database_config.host", *host)

	err := viper.WriteConfig()
	if err != nil {
		fmt.Println("No configuration file loaded: ", err)
		logrus.Errorln("No configuration file loaded - using defaults")
		panic("DB configuration file not found: ")
	}
}

func registerGetRedirect(e *echo.Echo, path string) {

	e.GET("/dashboard/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/call/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/call/:name/", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/search/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/search/:name/", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/registration/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/registration/:name/", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("(system:login)", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/preference/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})
}

// middle ware handler
func bodyDumpHandler(c echo.Context, reqBody, resBody []byte) {

	logrus.Println("================================")

	//printRequest(c.Request())

	logrus.Println("--------request body-------")
	printBody(reqBody)
	logrus.Println("---------------------------")

	logrus.Println("-------- response body --------")
	printBody(resBody)
	logrus.Println("-------------------------------")
	logrus.Println("=================================")
}

// body dump skipper
func skipper(c echo.Context) bool {

	if c.Request().Method == "POST" {
		logrus.Println(c.Request().URL.Path)
		return true
	}

	return false
}

// private method
func printBody(obj []byte) {

	logrus.WithFields(logrus.Fields{
		"json": string(obj),
	}).Info("Payload")
}

func printRequest(request *http.Request) {

	logrus.WithFields(logrus.Fields{
		"HOST":       request.Host,
		"PATH":       request.URL.Path,
		"METHOD":     request.Method,
		"QueryParam": request.URL.Query().Encode(),
	}).Info("Request")
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
			appFlags.DatabasePort)

		if err != nil {
			logrus.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logrus.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
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
			appFlags.DatabasePort)

		if err != nil {
			logrus.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logrus.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
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
			appFlags.DatabasePort)

		if err != nil {
			logrus.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logrus.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
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
			appFlags.DatabasePort)

		if err != nil {
			logrus.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logrus.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
			panic(err)
		}

		defer rootDb.Close()

		migration.CreateHomerRole(rootDb, appFlags.DatabaseHomerUser, appFlags.DatabaseHomerConfig, appFlags.DatabaseHomerData)
		migration.ShowUsers(rootDb)

		os.Exit(0)
	} else if *appFlags.RevokeHomerRole {

		rootDb, err := migration.GetDataRootDBSession(appFlags.DatabaseRootUser,
			appFlags.DatabaseRootPassword,
			appFlags.DatabaseRootDB,
			appFlags.DatabaseHost,
			appFlags.DatabasePort)

		if err != nil {
			logrus.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logrus.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
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
			appFlags.DatabasePort)

		if err != nil {
			logrus.Error("Couldn't establish connection. Please be sure you can have correct password", err)
			logrus.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
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
	)

	if err != nil {
		logrus.Error("Couldn't establish connection. Please be sure you can have correct password", err)
		logrus.Error("Try run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"")
		panic(err)
	}

	defer rootDb.Close()

	migration.CreateNewUser(rootDb, appFlags.DatabaseHomerUser, appFlags.DatabaseHomerPassword)
	migration.ShowUsers(rootDb)

	migration.CreateHomerDB(rootDb, appFlags.DatabaseHomerData, appFlags.DatabaseHomerUser)
	migration.CreateHomerDB(rootDb, appFlags.DatabaseHomerConfig, appFlags.DatabaseHomerUser)

	migration.CreateHomerRole(rootDb, appFlags.DatabaseHomerUser, appFlags.DatabaseHomerConfig, appFlags.DatabaseHomerData)

	servicesObject.configDBSession = getConfigDBSession()
	defer servicesObject.configDBSession.Close()
	nameHomerConfig := viper.GetString("database_config.name")

	migration.CreateHomerConfigTables(servicesObject.configDBSession, nameHomerConfig, *appFlags.UpgradeTableConfigDB, true)
	migration.PopulateHomerConfigTables(servicesObject.configDBSession, nameHomerConfig, *appFlags.ForcePopulate, appFlags.TablesPopulate)

	os.Exit(0)
}
