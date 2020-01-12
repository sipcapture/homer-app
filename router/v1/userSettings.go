package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo"
	controllerv1 "gitlab.com/qxip/webapp-go/controller/v1"
	"gitlab.com/qxip/webapp-go/data/service"
)

func RouteUserSettingsApis(acc *echo.Group, session *gorm.DB) {
	// initialize service of user
	userSettingService := service.UserSettingsService{Service: service.Service{Session: session}}
	// initialize user controller
	urc := controllerv1.UserSettingsController{
		UserSettingsService: &userSettingService,
	}
	// get user settings
	acc.GET("/user/settings", urc.GetAll)

}
