package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

func RouteAgentsubApis(acc *echo.Group, session *gorm.DB) {
	// initialize service of user
	AgentsubService := service.AgentsubService{ServiceConfig: service.ServiceConfig{Session: session}}
	// initialize user controller
	ass := controllerv1.AgentsubController{
		AgentsubService: &AgentsubService,
	}

	// create agent subscribe
	/************************************/
	acc.GET("/agent/subscribe", ass.GetAgentsub)
	acc.GET("/agent/subscribe/:guid", ass.GetAgentsubAgainstGUID)

	acc.POST("/agent/subscribe", ass.AddAgentsub)
	acc.POST("/agent/subscribe/:guid", ass.UpdateAgentsubAgainstGUID)

}
