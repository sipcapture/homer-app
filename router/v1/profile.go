package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

func RouteProfileApis(acc *echo.Group, session *gorm.DB) {
	// initialize service of user
	ProfileService := service.ProfileService{Service: service.Service{Session: session}}
	// initialize user controller
	hs := controllerv1.ProfileController{
		ProfileService: &ProfileService,
	}
	// get all dashboards
	acc.GET("/api/v3/admin/profiles", hs.GetDashboardList)
	//acc.GET("/hepsub/protocol", hs.GetHepsub)
}
