package apirouterv1

import (
	"github.com/labstack/echo"
	controllerv1 "gitlab.com/qxip/webapp-go/controller/v1"
	"gitlab.com/qxip/webapp-go/data/service"
)

// RouteStatisticApis : here you tell us what RouteStatisticApis is
func RouteRemoteApis(acc *echo.Group, serviceRemote service.ServiceRemote) {

	// initialize service of user
	remoteService := service.RemoteService{ServiceRemote: serviceRemote}

	// initialize user controller
	src := controllerv1.RemoteController{
		RemoteService: &remoteService,
	}

	// create new stats
	acc.GET("/search/remote/label", src.RemoteLabel)

	// create new stats
	acc.GET("/search/remote/values", src.RemoteValues)

	// create new stats
	acc.POST("/search/remote/data", src.RemoteData)

}
