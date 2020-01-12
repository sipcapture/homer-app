package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo"
	"gitlab.com/qxip/webapp-go/controller/v1"
	"gitlab.com/qxip/webapp-go/data/service"
)

func RouteAliasApis(acc *echo.Group, configSession *gorm.DB) {
	// initialize service of user
	aliasService := service.AliasService{Service: service.Service{Session: configSession}}
	// initialize user controller
	src := controllerv1.AliasController{
		AliasService: &aliasService,
	}
	acc.GET("/alias", src.GetAllAlias)
	acc.POST("/alias", src.AddAlias)
	acc.DELETE("/alias/:guid", src.DeleteAlias)
	acc.PUT("/alias/:guid", src.UpdateAlias)

}
