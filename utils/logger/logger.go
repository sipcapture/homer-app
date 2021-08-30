package logger

import (
	"os"
	"time"

	rotatelogs "github.com/lestrrat-go/file-rotatelogs"
	"github.com/rifflock/lfshook"
	"github.com/sirupsen/logrus"
)

type LogInfo logrus.Fields

type GormLogger struct{}

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
func InitLogger(path string, logname string, loglevelString string, logStdout bool) {

	env := os.Getenv("environment")
	isLocalHost := env == "local"

	// Log as JSON instead of the default ASCII formatter.
	logrus.SetFormatter(&logrus.JSONFormatter{})

	// Output to stdout instead of the default stderr
	// Can be any io.Writer, see below for File example
	if logStdout {
		logrus.SetOutput(os.Stdout)
	} else {
		logrus.SetOutput(os.Stderr)
	}

	/* log level default */
	if loglevelString == "" {
		loglevelString = "error"
	}

	if logLevel, ok := logrus.ParseLevel(loglevelString); ok == nil {
		// Only log the warning severity or above.
		logrus.SetLevel(logLevel)
	} else {
		logrus.Error("Couldn't parse loglevel", loglevelString)
		logrus.SetLevel(logrus.ErrorLevel)
	}

	if !isLocalHost {
		// configure file system hook
		configureLocalFileSystemHook(path, logname)
	}
}

func configureLocalFileSystemHook(pathName string, nameLog string) {

	logPath := pathName
	logName := nameLog

	if configPath := os.Getenv("WEBAPPLOGPATH"); configPath != "" {
		logPath = configPath
	}

	if configName := os.Getenv("WEBAPPLOGNAME"); configName != "" {
		logName = configName
	}

	pathLog := logPath + "/" + logName

	rLogs, err := rotatelogs.New(
		pathLog+".%Y_%m_%d_%H_%M",
		rotatelogs.WithLinkName(pathLog),
		rotatelogs.WithMaxAge(time.Duration(30*86400)*time.Second),
		rotatelogs.WithRotationTime(time.Duration(86400)*time.Second),
	)

	if err != nil {
		logrus.Println("Local file system hook initialize fail")
		return
	}

	logrus.AddHook(lfshook.NewHook(lfshook.WriterMap{
		logrus.InfoLevel:  rLogs,
		logrus.ErrorLevel: rLogs,
	}, &logrus.JSONFormatter{}))
}
