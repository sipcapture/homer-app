package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

func RouteDashboardApis(acc *echo.Group, session *gorm.DB) {
	// initialize service of user
	dashBoardService := service.DashBoardService{ServiceConfig: service.ServiceConfig{Session: session}}
	// initialize user controller
	dbc := controllerv1.DashBoardController{
		DashBoardService: &dashBoardService,
	}
	// get all dashboards
	acc.GET("/dashboard/info", dbc.GetDashBoardLists)
	// get all dashboards
	acc.GET("/dashboard/store/:dashboardId", dbc.GetDashBoard)
	// insert new dashboard
	acc.POST("/dashboard/store/:dashboardId", dbc.InsertDashboard)
	// insert new dashboard
	acc.PUT("/dashboard/store/:dashboardId", dbc.UpdateDashboard)
	// delete dashboard
	acc.DELETE("/dashboard/store/:dashboardId", dbc.DeleteDashboard)
	// dashboard reset
	acc.GET("/dashboard/reset", dbc.ResetUserDashboard)

}
