package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/auth"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

func RouteAliasApis(acc *echo.Group, configSession *gorm.DB) {
	// initialize service of user
	aliasService := service.AliasService{ServiceConfig: service.ServiceConfig{Session: configSession}}
	// initialize user controller
	src := controllerv1.AliasController{
		AliasService: &aliasService,
	}
	acc.GET("/alias", src.GetAllAlias)
	acc.POST("/alias", src.AddAlias, auth.IsAdmin)
	acc.DELETE("/alias/:guid", src.DeleteAlias, auth.IsAdmin)
	acc.PUT("/alias/:guid", src.UpdateAlias, auth.IsAdmin)

}
