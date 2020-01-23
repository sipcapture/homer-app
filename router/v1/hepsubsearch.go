package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

func RouteHepSubSearch(acc *echo.Group, session *gorm.DB) {
	// initialize service of user
	HepsubsearchService := service.HepsubsearchService{ServiceConfig: service.ServiceConfig{Session: session}}
	// initialize user controller
	hss := controllerv1.HepsubsearchController{
		HepsubsearchService: &HepsubsearchService,
	}

	// create agent subscribe
	/************************************/
	acc.POST("/hepsub/search", hss.DoHepsubsearch)

}
