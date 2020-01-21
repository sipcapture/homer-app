package apirouterv1

import (
	client "github.com/influxdata/influxdb1-client/v2"
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
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
	acc.GET("/statistic/_db", src.GetStatisticDBList)

	//acc.POST("/api/call/report/log", src.HepSub)
}
