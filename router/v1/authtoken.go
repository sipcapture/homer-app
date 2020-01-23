package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/auth"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

func RouteAuthTokenApis(acc *echo.Group, session *gorm.DB) {
	// initialize service of user
	AuthtokenService := service.AuthtokenService{ServiceConfig: service.ServiceConfig{Session: session}}
	// initialize user controller
	ats := controllerv1.AuthtokenController{
		AuthtokenService: &AuthtokenService,
	}

	// create agent subscribe
	/************************************/
	acc.GET("/token/auth", ats.GetAuthtoken, auth.IsAdmin)
	acc.GET("/token/auth/:guid", ats.GetAuthtokenAgainstGUID, auth.IsAdmin)

	acc.POST("/token/auth", ats.AddAuthtoken, auth.IsAdmin)
	acc.POST("/token/auth/:guid", ats.UpdateAuthtokenAgainstGUID, auth.IsAdmin)

	acc.DELETE("/token/auth/:guid", ats.DeleteAuthtokenAgainstGUID, auth.IsAdmin)

}
