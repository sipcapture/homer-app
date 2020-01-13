package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

func RouteAdvancedApis(acc *echo.Group, configSession *gorm.DB) {
	// initialize service of user
	AdvancedService := service.AdvancedService{Service: service.Service{Session: configSession}}
	// initialize user controller
	ac := controllerv1.AdvancedController{
		AdvancedService: &AdvancedService,
	}
	acc.GET("/advanced", ac.GetAll)
}
