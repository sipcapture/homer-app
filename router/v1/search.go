package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

func RouteSearchApis(acc *echo.Group, dataSession, configSession *gorm.DB) {
	// initialize service of user
	searchService := service.SearchService{Service: service.Service{Session: dataSession}}
	aliasService := service.AliasService{Service: service.Service{Session: configSession}}
	settingService := service.UserSettingsService{Service: service.Service{Session: configSession}}
	// initialize user controller
	src := controllerv1.SearchController{
		SearchService:  &searchService,
		SettingService: &settingService,
		AliasService:   &aliasService,
	}

	// create new user
	acc.POST("/search/call/data", src.SearchData)
	acc.POST("/search/call/message", src.GetMessageById)
	acc.POST("/call/transaction", src.GetTransaction)
	acc.POST("/call/report/qos", src.GetTransactionQos)
	acc.POST("/call/report/log", src.GetTransactionLog)
	acc.POST("/export/call/messages/pcap", src.GetMessagesAsPCap)
	acc.POST("/export/call/messages/text", src.GetMessagesAsText)

	//acc.POST("/api/call/report/log", src.HepSub)
}
