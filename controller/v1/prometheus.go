package controllerv1

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sirupsen/logrus"
)

type PrometheusController struct {
	Controller
	PrometheusService *service.PrometheusService
}

// swagger :route POST /prometheus/data proxy prometheusPrometheusData
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// parameters:
// + name: PrometheusObject
//   in: body
//   description: PrometheusObject parameters
//   schema:
//      type: PrometheusObject
//   required: true
// responses:
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (pc *PrometheusController) PrometheusData(c echo.Context) error {

	if !pc.PrometheusService.Active {
		logrus.Error("Prometheus service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Prometheus service is not enabled")
	}

	prometheusObject := model.PrometheusObject{}

	if err := c.Bind(&prometheusObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := pc.PrometheusService.PrometheusData(&prometheusObject)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route POST /prometheus/value proxy prometheusPrometheusValue
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
//
// parameters:
// + name: PrometheusObject
//   in: body
//   description: PrometheusObject parameters
//   schema:
//     type: PrometheusObject
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   200: body:ListUsers
//   400: body:FailureResponse
func (pc *PrometheusController) PrometheusValue(c echo.Context) error {

	if !pc.PrometheusService.Active {
		logrus.Error("Prometheus service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Prometheus service is not enabled")
	}

	prometheusObject := model.PrometheusObject{}

	if err := c.Bind(&prometheusObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := pc.PrometheusService.PrometheusValue(&prometheusObject)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /prometheus/labels proxy prometheusPrometheusLabels
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//
//   200: body:ListLabels
// 		  example: ["go_goroutines","go_info","go_threads"]
//   400: body:FailureResponse
func (pc *PrometheusController) PrometheusLabels(c echo.Context) error {

	if !pc.PrometheusService.Active {
		logrus.Error("Prometheus service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Prometheus service is not enabled")
	}

	responseData, err := pc.PrometheusService.PrometheusLabels()
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /prometheus/label/{labelName} proxy prometheusPrometheusLabelData
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// Security:
// - bearer: []
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// parameters:
// + name: labelName
//   in: path
//   example: 1
//   description: Label name
//   required: true
//   type: string
// responses:
//   200: body:Label
//   400: body:FailureResponse
func (pc *PrometheusController) PrometheusLabelData(c echo.Context) error {

	if !pc.PrometheusService.Active {
		logrus.Error("Prometheus service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Prometheus service is not enabled")
	}

	label := c.Param("userlabel")

	logrus.Println("LABEL", label)

	responseData, err := pc.PrometheusService.PrometheusLabelData(label)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}
