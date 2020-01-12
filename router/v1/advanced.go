package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo"
	"gitlab.com/qxip/webapp-go/controller/v1"
	"gitlab.com/qxip/webapp-go/data/service"
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
