package controllerv1

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
	"gitlab.com/qxip/webapp-go/data/service"
	"gitlab.com/qxip/webapp-go/model"
	httpresponse "gitlab.com/qxip/webapp-go/network/response"
	"gitlab.com/qxip/webapp-go/system/webmessages"
)

type PrometheusController struct {
	Controller
	PrometheusService *service.PrometheusService
}

// swagger:route GET /api/prometheus/data search
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// Security:
// - bearer
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header

// responses:
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (pc *PrometheusController) PrometheusData(c echo.Context) error {

	prometheusObject := model.PrometheusObject{}

	if err := c.Bind(&prometheusObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := pc.PrometheusService.PrometheusData(&prometheusObject)
	if err != nil {
		fmt.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /api/prometheus/value search
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// Security:
// - bearer
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header

// responses:
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (pc *PrometheusController) PrometheusValue(c echo.Context) error {

	prometheusObject := model.PrometheusObject{}

	if err := c.Bind(&prometheusObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := pc.PrometheusService.PrometheusValue(&prometheusObject)
	if err != nil {
		fmt.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /api/prometheus/labels search
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// Security:
// - bearer
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header

// responses:
//   '200': body:ListLabels
//   '400': body:UserLoginFailureResponse
func (pc *PrometheusController) PrometheusLabels(c echo.Context) error {

	responseData, err := pc.PrometheusService.PrometheusLabels()
	if err != nil {
		fmt.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /api/prometheus/label search
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// Security:
// - bearer
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header

// responses:
//   '200': body:ListLabels
//   '400': body:UserLoginFailureResponse
func (pc *PrometheusController) PrometheusLabelData(c echo.Context) error {

	label := c.Param("userlabel")

	fmt.Println("LABEL", label)

	responseData, err := pc.PrometheusService.PrometheusLabelData(label)
	if err != nil {
		fmt.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}
