package logger

import (
	"log"
	"log/syslog"
	"os"
	"path/filepath"
	"strings"
	"time"

	rotatelogs "github.com/lestrrat-go/file-rotatelogs"
	globalConfig "github.com/sipcapture/homer-app/config"
	"github.com/sirupsen/logrus"
)

type LogInfo logrus.Fields

var RLogs *rotatelogs.RotateLogs
var Logger = logrus.New()

type GormLogger struct{}

// Code Action
//LOG_INFO
const (
	SYSLOG_LOG_EMERG   = "LOG_EMERG"
	SYSLOG_LOG_ALERT   = "LOG_ALERT"
	SYSLOG_LOG_CRIT    = "LOG_CRIT"
	SYSLOG_LOG_ERR     = "LOG_ERR"
	SYSLOG_LOG_WARNING = "LOG_WARNING"
	SYSLOG_LOG_NOTICE  = "LOG_NOTICE"
	SYSLOG_LOG_INFO    = "LOG_INFO"
	SYSLOG_LOG_DEBUG   = "LOG_DEBUG"
)

/* gorm logger for logrus */
func (*GormLogger) Print(v ...interface{}) {
	if v[0] == "sql" {
		logrus.WithFields(logrus.Fields{"module": "gorm", "type": "sql"}).Print(v[3])
	}
	if v[0] == "log" {
		logrus.WithFields(logrus.Fields{"module": "gorm", "type": "log"}).Print(v[2])
	}
}

// initLogger function
func InitLogger() {

	//env := os.Getenv("environment")
	//isLocalHost := env == "local"
	if globalConfig.Setting.LOG_SETTINGS.Json {
		// Log as JSON instead of the default ASCII formatter.
		Logger.SetFormatter(&logrus.JSONFormatter{})
	} else {
		Logger.Formatter.(*logrus.TextFormatter).DisableTimestamp = false
		Logger.Formatter.(*logrus.TextFormatter).DisableColors = true
	}
	// Output to stdout instead of the default stderr
	// Can be any io.Writer, see below for File example
	if globalConfig.Setting.LOG_SETTINGS.Stdout {
		Logger.SetOutput(os.Stdout)
		log.SetOutput(os.Stdout)
	}

	/* log level default */
	if globalConfig.Setting.LOG_SETTINGS.Level == "" {
		globalConfig.Setting.LOG_SETTINGS.Level = "error"
	}

	if logLevel, ok := logrus.ParseLevel(globalConfig.Setting.LOG_SETTINGS.Level); ok == nil {
		// Only log the warning severity or above.
		Logger.SetLevel(logLevel)
	} else {
		Logger.Error("Couldn't parse loglevel", globalConfig.Setting.LOG_SETTINGS.Level)
		Logger.SetLevel(logrus.ErrorLevel)
	}

	Logger.Info("init logging system")

	if !globalConfig.Setting.LOG_SETTINGS.Stdout && !globalConfig.Setting.LOG_SETTINGS.SysLog {
		// configure file system hook
		configureLocalFileSystemHook()
	} else if !globalConfig.Setting.LOG_SETTINGS.Stdout {
		configureSyslogHook()
	}
}

// SetLoggerLevel function
func SetLoggerLevel(loglevelString string) {

	if logLevel, ok := logrus.ParseLevel(loglevelString); ok == nil {
		// Only log the warning severity or above.
		Logger.SetLevel(logLevel)
	} else {
		Logger.Error("Couldn't parse loglevel", loglevelString)
		Logger.SetLevel(logrus.ErrorLevel)
	}
}

func configureLocalFileSystemHook() {

	logPath := globalConfig.Setting.LOG_SETTINGS.Path
	logName := globalConfig.Setting.LOG_SETTINGS.Name
	var err error

	if configPath := os.Getenv("WEBAPPLOGPATH"); configPath != "" {
		logPath = configPath
	}

	if configName := os.Getenv("WEBAPPLOGNAME"); configName != "" {
		logName = configName
	}

	fileLogExtension := filepath.Ext(logName)
	fileLogBase := strings.TrimSuffix(logName, fileLogExtension)

	pathAllLog := logPath + "/" + fileLogBase + "_%Y%m%d%H%M" + fileLogExtension
	pathLog := logPath + "/" + logName

	RLogs, err = rotatelogs.New(
		pathAllLog,
		rotatelogs.WithLinkName(pathLog),
		rotatelogs.WithMaxAge(time.Duration(globalConfig.Setting.LOG_SETTINGS.MaxAgeDays)*time.Hour),
		rotatelogs.WithRotationTime(time.Duration(globalConfig.Setting.LOG_SETTINGS.RotationHours)*time.Hour),
	)

	if err != nil {
		Logger.Println("Local file system hook initialize fail")
		return
	}

	Logger.SetOutput(RLogs)
	log.SetOutput(RLogs)
}
func configureSyslogHook() {

	var err error

	Logger.Println("Init syslog...")

	sevceritySyslog := getSevirtyByName(globalConfig.Setting.LOG_SETTINGS.SysLogLevel)

	syslogger, err := syslog.New(sevceritySyslog, "homer-app-server")

	if err != nil {
		Logger.Println("Unable to connect to syslog:", err)
	}

	Logger.SetOutput(syslogger)
	log.SetOutput(syslogger)

}

func Info(args ...interface{}) {
	Logger.Info(args...)
}

func Error(args ...interface{}) {
	Logger.Error(args...)
}

func Debug(args ...interface{}) {
	Logger.Debug(args...)
}

func getSevirtyByName(sevirity string) syslog.Priority {

	switch sevirity {
	case SYSLOG_LOG_EMERG:
		return syslog.LOG_EMERG
	case SYSLOG_LOG_ALERT:
		return syslog.LOG_ALERT
	case SYSLOG_LOG_CRIT:
		return syslog.LOG_CRIT
	case SYSLOG_LOG_ERR:
		return syslog.LOG_ERR
	case SYSLOG_LOG_WARNING:
		return syslog.LOG_WARNING
	case SYSLOG_LOG_NOTICE:
		return syslog.LOG_NOTICE
	case SYSLOG_LOG_INFO:
		return syslog.LOG_INFO
	case SYSLOG_LOG_DEBUG:
		return syslog.LOG_DEBUG
	default:
		return syslog.LOG_INFO

	}
}
