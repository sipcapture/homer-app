// Homer-App
//

// @title Homer-App User interface API
// @version 1.0
// @description Homer-App User interface API.
// @termsOfService http://www.qxip.net

// @contact.name Alexandr Dubovikov
// @contact.url http://www.sipcapture.org
// @contact.email alexandr.dubovikov@gmail.com

// @license.name AGPL
// @license.url https://www.gnu.org/licenses/agpl-3.0.en.html

// @copyright: QXIP B.V. 2019-2020

// @host localhost:8090
// @BasePath /v3

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
	"github.com/sipcapture/homer-app/auth"
	"github.com/sipcapture/homer-app/data/service"
	_ "github.com/sipcapture/homer-app/docs"
	"github.com/sipcapture/homer-app/migration"
	apirouterv1 "github.com/sipcapture/homer-app/router/v1"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sipcapture/homer-app/utils/ldap"
	"github.com/sipcapture/homer-app/utils/logger"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	echoSwagger "github.com/swaggo/echo-swagger"
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

//params for Flags
type CommandLineFlags struct {
	CreateConfigDB            *bool   `json:"create_config_db"`
	CreateDataDB              *bool   `json:"create_data_db"`
	CreateTableConfigDB       *bool   `json:"create_table_config"`
	PopulateTableConfigDB     *bool   `json:"populate_table_config"`
	CreateHomerUser           *bool   `json:"create_homer_user"`
	DeleteHomerUser           *bool   `json:"delete_homer_user"`
	ShowVersion               *bool   `json:"version"`
	ForcePopulate             *bool   `json:"force_insert"`
	RevokeHomerRole           *bool   `json:"revoke_homer_role"`
	CreateHomerRole           *bool   `json:"create_homer_role"`
	SaveHomerDbConfigToConfig *bool   `json:"save_db_config_to_config"`
	SaveHomerDbDataToConfig   *bool   `json:"save_db_data_to_config"`
	ShowDbUsers               *bool   `json:"show_db_users"`
	ShowHelpMessage           *bool   `json:"help"`
	DatabaseRootUser          *string `json:"root_user"`
	DatabaseRootPassword      *string `json:"root_password"`
	DatabaseHost              *string `json:"root_host"`
	DatabasePort              *int    `json:"root_port"`
	DatabaseRootDB            *string `json:"root_db"`
	DatabaseHomerUser         *string `json:"homer_user"`
	DatabaseHomerPassword     *string `json:"homer_password"`
	DatabaseHomerConfig       *string `json:"db_homer_config"`
	DatabaseHomerData         *string `json:"db_homer_data"`
	PathWebAppConfig          *string `json:"path_webapp"`
	LogPathWebApp             *string `json:"path_log_webapp"`
	LogName                   *string `json:"log_name_webapp"`
}

var appFlags CommandLineFlags
var ldapClient ldap.LDAPClient
var authType string

/* init flags */
func initFlags() {
	appFlags.CreateConfigDB = flag.Bool("create-config-db", false, "create config db")
	appFlags.CreateDataDB = flag.Bool("create-data-db", false, "create data db")
	appFlags.CreateTableConfigDB = flag.Bool("create-table-db-config", false, "create table in db config")
	appFlags.PopulateTableConfigDB = flag.Bool("populate-table-db-config", false, "populate table in db config")

	appFlags.CreateHomerUser = flag.Bool("create-homer-user", false, "create homer user")
	appFlags.DeleteHomerUser = flag.Bool("delete-homer-user", false, "delete homer user")
	appFlags.ShowDbUsers = flag.Bool("show-db-users", false, "show db users")

	appFlags.ForcePopulate = flag.Bool("force-populate", false, "force populate all records to config")
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
	appFlags.DatabaseRootDB = flag.String("database-root", "systems", "database-root")
	appFlags.DatabaseHomerUser = flag.String("database-homer-user", "homer_user", "database-homer-user")
	appFlags.DatabaseHomerPassword = flag.String("database-homer-password", "homer_password", "database-homer-password")
	appFlags.DatabaseHomerConfig = flag.String("database-homer-config", "homer_config", "database-homer-config")
	appFlags.DatabaseHomerData = flag.String("database-homer-data", "homer_data", "database-homer-data")

	appFlags.PathWebAppConfig = flag.String("webapp-config-path", "/usr/local/homer/etc", "the path to the webapp config file")
	appFlags.LogName = flag.String("webapp-log-name", "homer-webapp.log", "the name prefix of the log file.")
	appFlags.LogPathWebApp = flag.String("webapp-log-path", "/usr/local/homer/log", "the path for the log file.")

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
	logger.InitLogger(logPath, logName)

	/* first check admin flags */
	checkAdminFlags()

	/* now check if we do write to config */
	if *appFlags.SaveHomerDbConfigToConfig {
		applyDBParamToConfig(appFlags.DatabaseHomerUser, appFlags.DatabaseHomerPassword, appFlags.DatabaseHomerConfig, appFlags.DatabaseHost, false)
		os.Exit(0)
	} else if *appFlags.SaveHomerDbDataToConfig {
		applyDBParamToConfig(appFlags.DatabaseHomerUser, appFlags.DatabaseHomerPassword, appFlags.DatabaseHomerData, appFlags.DatabaseHost, true)
		os.Exit(0)
	}

	configDBSession := getConfigDBSession()
	defer configDBSession.Close()

	if *appFlags.CreateTableConfigDB {
		nameHomerConfig := viper.GetString("database_config.name")
		migration.CreateHomerConfigTables(configDBSession, nameHomerConfig)
		os.Exit(0)
	} else if *appFlags.PopulateTableConfigDB {

		nameHomerConfig := viper.GetString("database_config.name")
		migration.PopulateHomerConfigTables(configDBSession, nameHomerConfig, *appFlags.ForcePopulate)

		os.Exit(0)
	}

	// configure new db session
	dataDBSession := getDataDBSession()
	for val := range dataDBSession {
		defer dataDBSession[val].Close()
	}

	// configure new influx db session
	influxDBSession := getInfluxDBSession()
	defer influxDBSession.Close()

	// configure new influx db session
	servicePrometheus := getPrometheusDBSession()
	//defer prometheusService.Close()

	serviceRemote := getRemoteDBSession()
	//defer httpClient.CloseIdleConnections()

	authType = viper.GetString("auth_settings.type")
	/* check the auth type */
	if authType == "" {
		authType = "internal"
	}
	/* Check LDAP here */
	if authType == "ldap" {
		fmt.Println("Ldap implementation here")
		ldapClient.Base = viper.GetString("ldap_settings.Base")
		ldapClient.Host = viper.GetString("ldap_settings.Host")
		ldapClient.Port = viper.GetInt("ldap_settings.Port")
		ldapClient.UseSSL = viper.GetBool("ldap_settings.UseSSL")
		ldapClient.BindDN = viper.GetString("ldap_settings.BindDN")
		ldapClient.BindPassword = viper.GetString("ldap_settings.BindPassword")
		ldapClient.UserFilter = viper.GetString("ldap_settings.UserFilter")
		ldapClient.GroupFilter = viper.GetString("ldap_settings.GroupFilter")
		ldapClient.Attributes = viper.GetStringSlice("ldap_settings.Attributes")
		defer ldapClient.Close()
	}

	// configure to serve WebServices
	configureAsHTTPServer(dataDBSession, configDBSession, influxDBSession, servicePrometheus, serviceRemote)
}

func configureAsHTTPServer(dataDBSession map[string]*gorm.DB,
	configDBSession *gorm.DB, influxDBSession client.Client,
	servicePrometheus service.ServicePrometheus,
	serviceRemote service.ServiceRemote) {

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
				return false
			},
			Level: 5,
		}))
	}

	registerGetRedirect(e, rootPath)

	// perform routing for v1 version of web apis
	performV1APIRouting(e, dataDBSession, configDBSession, influxDBSession, servicePrometheus, serviceRemote)
	httpHost := viper.GetString("http_settings.host")
	httpPort := viper.GetString("http_settings.port")
	httpURL := fmt.Sprintf("%s:%s", httpHost, httpPort)

	//Doc Swagger
	e.GET("/swagger/*", echoSwagger.WrapHandler)

	// Server
	e.Logger.Fatal(e.Start(httpURL))
}

func performV1APIRouting(e *echo.Echo, dataDBSession map[string]*gorm.DB, configDBSession *gorm.DB,
	influxDBSession client.Client,
	servicePrometheus service.ServicePrometheus,
	serviceRemote service.ServiceRemote) {

	// accessible web services will fall in this group
	acc := e.Group("/api/v3")

	if authType == "ldap" {
		apirouterv1.RouteUserApis(acc, configDBSession, &ldapClient)
	} else {
		apirouterv1.RouteUserApis(acc, configDBSession, nil)
	}

	// restricted web services will fall in this group
	res := e.Group("/api/v3")
	// Configure middleware with the custom claims type
	config := middleware.JWTConfig{
		Claims:     &auth.JwtUserClaim{},
		SigningKey: []byte(auth.JwtSecret),
	}

	res.Use(middleware.JWTWithConfig(config))
	res.Use(auth.MiddlewareRes)

	fmt.Println(auth.JwtUserClaim{})
	// route user apis
	apirouterv1.RouteUserDetailsApis(res, configDBSession)
	// route search apis
	apirouterv1.RouteSearchApis(res, dataDBSession, configDBSession)
	// route alias apis
	apirouterv1.RouteAliasApis(res, configDBSession)
	// route dashboards apis
	apirouterv1.RouteDashboardApis(res, configDBSession)
	// route userSettings apis
	apirouterv1.RouteUserSettingsApis(res, configDBSession)
	// route advanced apis
	apirouterv1.RouteAdvancedApis(res, configDBSession)
	// route hepsub apis
	apirouterv1.RouteHepsubApis(res, configDBSession)
	// route profile apis
	apirouterv1.RouteProfileApis(res, configDBSession)
	// route mapping apis
	apirouterv1.RouteMappingdApis(res, configDBSession)
	// route RouteStatisticApis apis
	apirouterv1.RouteStatisticApis(res, influxDBSession)
	// route RouteStatisticApis apis
	apirouterv1.RoutePrometheusApis(res, servicePrometheus)
	// route RouteRemoteApis apis
	apirouterv1.RouteRemoteApis(res, serviceRemote)
}

// getSession creates a new mongo session and panics if connection error occurs
func getDataDBSession() map[string]*gorm.DB {

	dataConfig := viper.GetStringMapStringSlice("database_data")
	dbMap := make(map[string]*gorm.DB)

	if _, ok := dataConfig["user"]; !ok {
		for val := range dataConfig {

			keyData := "database_data." + val

			user := viper.GetString(keyData + ".user")
			password := viper.GetString(keyData + ".pass")
			name := viper.GetString(keyData + ".name")
			host := viper.GetString(keyData + ".host")
			node := viper.GetString(keyData + ".node")

			fmt.Println(fmt.Sprintf("Connecting to [%s, %s, %s, %s]\n", host, user, name, node))
			//fmt.Println(fmt.Sprintf("%s\n%s\n%s\n%s\n CONNECT STRING\n", host, user, password, name))

			db, err := gorm.Open("postgres", "host="+host+" user="+user+" dbname="+name+" sslmode=disable password="+password)
			dbMap[val] = db
			if err != nil {
				logrus.Error(err)
				panic("failed to connect database")
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

		fmt.Println(fmt.Sprintf("Connecting to the old way: [%s, %s, %s]\n", host, user, name))

		db, err := gorm.Open("postgres", "host="+host+" user="+user+" dbname="+name+" sslmode=disable password="+password)
		dbMap["localnode"] = db

		if err != nil {
			logrus.Error(err)
			panic("failed to connect database")
		}
		logrus.Println("----------------------------------- ")
		logrus.Println("*** Database Data Session created *** ")
		logrus.Println("----------------------------------- ")
	}

	return dbMap
}

// getSession creates a new mongo session and panics if connection error occurs
func getConfigDBSession() *gorm.DB {
	user := viper.GetString("database_config.user")
	password := viper.GetString("database_config.pass")
	name := viper.GetString("database_config.name")
	host := viper.GetString("database_config.host")

	//fmt.Println(fmt.Sprintf("%s\n%s\n%s\n%s\n CONNECT STRING\n", host, user, password, name))

	db, err := gorm.Open("postgres", "host="+host+" user="+user+" dbname="+name+" sslmode=disable password="+password)

	if err != nil {
		logrus.Error(err)
		panic("failed to connect database")
	}
	logrus.Println("----------------------------------- ")
	logrus.Println("*** Database Config Session created *** ")
	logrus.Println("----------------------------------- ")
	return db
}

// getInfluxDBSession creates a new influxdb session and panics if connection error occurs
func getInfluxDBSession() client.Client {

	user := viper.GetString("influxdb_config.user")
	password := viper.GetString("influxdb_config.pass")
	//name := viper.GetString("influxdb_config.name")
	host := viper.GetString("influxdb_config.host")

	//fmt.Println(fmt.Sprintf("%s\n%s\n%s\n%s\n InfluxDB CONNECT STRING\n", host, user, password, name))

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

	logrus.Println("----------------------------------- ")
	logrus.Println("*** Influx Database Session created *** ")
	logrus.Println("----------------------------------- ")
	return influxClient
}

// getInfluxDBSession creates a new influxdb session and panics if connection error occurs
func getPrometheusDBSession() service.ServicePrometheus {

	user := viper.GetString("prometheus_config.user")
	password := viper.GetString("prometheus_config.pass")
	host := viper.GetString("prometheus_config.host")
	api := viper.GetString("prometheus_config.api")

	//fmt.Println(fmt.Sprintf("%s\n%s\n%s\n%s\n Prometheus CONNECT STRING\n", host, api, user, password))

	httpClient := &http.Client{
		Timeout: time.Second * 10,
	}

	servicePrometheus := service.ServicePrometheus{
		HttpClient: httpClient,
		User:       user,
		Password:   password,
		Host:       host,
		Api:        api,
	}

	logrus.Println("------------------------------------ ")
	logrus.Println("**** Prometheus Session created **** ")
	logrus.Println("------------------------------------ ")
	return servicePrometheus
}

// getInfluxDBSession creates a new influxdb session and panics if connection error occurs
func getRemoteDBSession() service.ServiceRemote {

	user := viper.GetString("loki_config.user")
	password := viper.GetString("lokiconfig.pass")
	host := viper.GetString("loki_config.host")
	api := viper.GetString("loki_config.api")

	//fmt.Println(fmt.Sprintf("%s\n%s\n%s\n%s\n Loki CONNECT STRING\n", host, api, user, password))

	httpClient := &http.Client{
		Timeout: time.Second * 10,
	}

	serviceRemote := service.ServiceRemote{
		HttpClient: httpClient,
		User:       user,
		Password:   password,
		Host:       host,
		Api:        api,
	}

	logrus.Println("------------------------------------ ")
	logrus.Println("**** Loki Session created **** ")
	logrus.Println("------------------------------------ ")
	return serviceRemote
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

func applyDBParamToConfig(user *string, password *string, dbname *string, host *string, writeType bool) {

	createString := fmt.Sprintf("\r\nHOMER - writing data to config [user=%s password=%s, dbname=%s, host=%s]", *user, *password, *dbname, *host)

	heputils.Colorize(heputils.ColorRed, createString)

	if writeType {
		viper.Set("database_data.user", *user)
		viper.Set("database_data.pass", *password)
		viper.Set("database_data.name", *dbname)
		viper.Set("database_data.host", *host)
	} else {
		viper.Set("database_config.user", *user)
		viper.Set("database_config.pass", *password)
		viper.Set("database_config.name", *dbname)
		viper.Set("database_config.host", *host)
	}

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

	e.GET("/swagger/index.html", func(c echo.Context) (err error) {
		return c.File(path + "/jopa.html")
	})

	e.GET("/call/:name", func(c echo.Context) (err error) {
		return c.File(path + "/index.html")
	})

	e.GET("/registration/:name", func(c echo.Context) (err error) {
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

	printRequest(c.Request())

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
