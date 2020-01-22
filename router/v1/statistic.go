package apirouterv1

import (
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
	"github.com/sipcapture/homer-app/data/service"
)

// RouteStatisticApis : here you tell us what RouteStatisticApis is
func RouteStatisticApis(acc *echo.Group, influxClient service.ServiceInfluxDB) {
	// initialize service of user
	statisticService := service.StatisticService{ServiceInfluxDB: influxClient}

	// initialize user controller
	src := controllerv1.StatisticController{
		StatisticService: &statisticService,
	}

	// create new stats
	acc.POST("/statistic/data", src.StatisticData)
	acc.GET("/statistic/_db", src.GetStatisticDBList)
	acc.POST("/statistic/_retentions", src.GetStatisticRetentionsList)
	acc.GET("/statistic/_measurements/:dbid", src.GetStatisticMeasurementsList)
	acc.POST("/statistic/_metrics", src.GetStatisticMetricsList)
	acc.POST("/statistic/_tags", src.GetStatisticTagsList)

	//acc.POST("/api/call/report/log", src.HepSub)
}
