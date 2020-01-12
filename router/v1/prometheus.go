package apirouterv1

import (
	"github.com/labstack/echo"
	controllerv1 "gitlab.com/qxip/webapp-go/controller/v1"
	"gitlab.com/qxip/webapp-go/data/service"
)

// RouteStatisticApis : here you tell us what RouteStatisticApis is
func RoutePrometheusApis(acc *echo.Group, servicePrometheus service.ServicePrometheus) {

	// initialize service of user
	prometheusService := service.PrometheusService{ServicePrometheus: servicePrometheus}

	// initialize user controller
	src := controllerv1.PrometheusController{
		PrometheusService: &prometheusService,
	}

	// create new stats
	acc.POST("/prometheus/data", src.PrometheusData)

	// get new labels
	acc.GET("/prometheus/label/:userlabel", src.PrometheusLabelData)

	// get new labels
	acc.GET("/prometheus/labels", src.PrometheusLabels)

	// get new values
	acc.POST("/prometheus/value", src.PrometheusValue)
}
