package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

// routesearch Apis
func RouteSearchApis(acc *echo.Group, dataSession map[string]*gorm.DB, configSession *gorm.DB, externalDecoder service.ExternalDecoder) {
	// initialize service of user
	searchService := service.SearchService{ServiceData: service.ServiceData{Session: dataSession, Decoder: externalDecoder}}
	aliasService := service.AliasService{ServiceConfig: service.ServiceConfig{Session: configSession}}
	settingService := service.UserSettingsService{ServiceConfig: service.ServiceConfig{Session: configSession}}
	// initialize user controller
	src := controllerv1.SearchController{
		SearchService:  &searchService,
		SettingService: &settingService,
		AliasService:   &aliasService,
	}

	// create new user
	acc.POST("/search/call/data", src.SearchData)
	acc.POST("/search/call/message", src.GetMessageById)
	acc.GET("/database/node/list", src.GetDBNodeList)

	acc.POST("/search/call/decode/message", src.GetDecodeMessageById)
	acc.POST("/call/transaction", src.GetTransaction)
	acc.POST("/call/report/qos", src.GetTransactionQos)
	acc.POST("/call/report/log", src.GetTransactionLog)
	acc.POST("/export/call/messages/pcap", src.GetMessagesAsPCap)
	acc.POST("/export/call/messages/text", src.GetMessagesAsText)

	//acc.POST("/api/call/report/log", src.HepSub)
}
