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
	/* search by all */
	acc.GET("/agent/type", ass.GetAgentsub)
	/* search by type */
	acc.GET("/agent/type/:type", ass.GetAgentsubByType)

	acc.GET("/agent/subscribe/:guid", ass.GetAgentsubAgainstGUID)
	acc.DELETE("/agent/subscribe/:guid", ass.DeleteAgentsubAgainstGUID)

	/* search */
	acc.POST("/agent/search/:type/:guid", ass.GetAgentsubAgainstGUID)

}

func RouteAgentsubAuthKeyApis(acc *echo.Group, session *gorm.DB) {
	// initialize service of user
	AgentsubService := service.AgentsubService{ServiceConfig: service.ServiceConfig{Session: session}}
	// initialize user controller
	ass := controllerv1.AgentsubController{
		AgentsubService: &AgentsubService,
	}

	// create agent subscribe
	/************************************/
	acc.POST("/agent/subscribe", ass.AddAgentsubWithKey)
}
