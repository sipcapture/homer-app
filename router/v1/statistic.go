package apirouterv1

import (
	client "github.com/influxdata/influxdb1-client/v2"
	"github.com/labstack/echo"
	controllerv1 "gitlab.com/qxip/webapp-go/controller/v1"
	"gitlab.com/qxip/webapp-go/data/service"
)

// RouteStatisticApis : here you tell us what RouteStatisticApis is
func RouteStatisticApis(acc *echo.Group, influxClient client.Client) {
	// initialize service of user
	statisticService := service.StatisticService{ServiceInfluxDB: service.ServiceInfluxDB{InfluxClient: influxClient}}

	// initialize user controller
	src := controllerv1.StatisticController{
		StatisticService: &statisticService,
	}

	// create new stats
	acc.POST("/statistic/data", src.StatisticData)
	//acc.POST("/api/call/report/log", src.HepSub)
}
