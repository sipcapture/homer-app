package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
)

//comments
func RouteProfileApis(acc *echo.Group, session *gorm.DB, databaseNodeMap []model.DatabasesMap) {
	// initialize service of user
	ProfileService := service.ProfileService{ServiceConfig: service.ServiceConfig{Session: session}, DatabaseNodeMap: &databaseNodeMap}
	// initialize user controller
	hs := controllerv1.ProfileController{
		ProfileService: &ProfileService,
	}
	// get all dashboards
	acc.GET("/admin/profiles", hs.GetDashboardList)
	acc.GET("/database/node/list", hs.GetDBNodeList)

	//acc.GET("/hepsub/protocol", hs.GetHepsub)
}
