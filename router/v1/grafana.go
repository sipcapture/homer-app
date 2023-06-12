package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

// RouteStatisticApis : here you tell us what RouteStatisticApis is
func RouteGrafanaApis(acc *echo.Group, session *gorm.DB, serviceGrafana service.ServiceGrafana) {

	// initialize service of user
	grafanaService := service.GrafanaService{ServiceConfig: service.ServiceConfig{Session: session}, ServiceGrafana: serviceGrafana}

	// initialize user controller
	src := controllerv1.GrafanaController{
		GrafanaService: &grafanaService,
	}

	// create new stats
	acc.GET("/proxy/grafana/url", src.GrafanaURL)
	//
	acc.GET("/proxy/grafana/path", src.GrafanaPath)
	// create new stats
	acc.GET("/proxy/grafana/status", src.GrafanaStatus)

	// create new requests
	acc.GET("/proxy/grafana/request/d/:uid/:param", src.GrafanaGetDashboardRequest)

	// create new stats
	acc.GET("/proxy/grafana/org", src.GrafanaORG)

	// create new stats
	acc.GET("/proxy/grafana/folders", src.GrafanaFolders)

	//get new search by uuid
	acc.GET("/proxy/grafana/search/:uid", src.GrafanaGetFoldersAgainstUUID)

	// create new stats
	acc.GET("/proxy/grafana/dashboards/uid/:uid", src.GrafanaGetDashboardAgainstUUID)

}
