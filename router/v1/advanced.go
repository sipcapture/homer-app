package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/auth"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

func RouteAdvancedApis(acc *echo.Group, configSession *gorm.DB) {
	// initialize service of user
	AdvancedService := service.AdvancedService{ServiceConfig: service.ServiceConfig{Session: configSession}}
	// initialize user controller
	ac := controllerv1.AdvancedController{
		AdvancedService: &AdvancedService,
	}
	acc.GET("/advanced", ac.GetAll, auth.IsAdmin)
	acc.GET("/advanced/:guid", ac.GetAdvancedAgainstGUID, auth.IsAdmin)
	acc.POST("/advanced", ac.AddAdvanced, auth.IsAdmin)
	acc.DELETE("/advanced/:guid", ac.DeleteAdvancedAgainstGUID, auth.IsAdmin)
}
