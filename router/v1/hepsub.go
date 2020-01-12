package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo"
	"github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

func RouteHepsubApis(acc *echo.Group, session *gorm.DB) {
	// initialize service of user
	HepsubService := service.HepsubService{Service: service.Service{Session: session}}
	// initialize user controller
	hs := controllerv1.HepsubController{
		HepsubService: &HepsubService,
	}
	// get all dashboards

	acc.GET("/hepsub/protocol/:id/:transaction", hs.GetHepSubFields)
	acc.GET("/hepsub/protocol", hs.GetHepSub)
	acc.GET("/hepsub/protocol/:guid", hs.GetHepSubAgainstGUID)
	acc.POST("/hepsub/protocol", hs.AddHepSub)
	acc.PUT("/hepsub/protocol/:guid", hs.UpdateHepSubAgainstGUID)
	acc.DELETE("/hepsub/protocol/:guid", hs.DeleteHepSubAgainstGUID)
}
