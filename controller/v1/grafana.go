package controllerv1

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/data/service"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sirupsen/logrus"
)

type GrafanaController struct {
	Controller
	GrafanaService *service.GrafanaService
}

// swagger:route GET /proxy/grafana/url proxy grafanaGrafanaURL
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
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (pc *GrafanaController) GrafanaURL(c echo.Context) error {

	responseData, err := pc.GrafanaService.GrafanaURL()
	if err != nil {
		logrus.Println(responseData)
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /proxy/grafana/org proxy grafanaGrafanaORG
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
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (pc *GrafanaController) GrafanaORG(c echo.Context) error {

	err := pc.GrafanaService.SetGrafanaObject()
	if err != nil {
		logrus.Error("Grafana service is not configured")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}

	responseData, err := pc.GrafanaService.GrafanaORG()
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /proxy/grafana/folders proxy grafanaGrafanaFolders
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
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (pc *GrafanaController) GrafanaFolders(c echo.Context) error {

	err := pc.GrafanaService.SetGrafanaObject()
	if err != nil {
		logrus.Error("Grafana service is not configured")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}

	responseData, err := pc.GrafanaService.GrafanaFolders()
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:operation GET /proxy/grafana/dashboards/uid/{uid} proxy grafanaGrafanaGetDashboardAgainstUUID
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// parameters:
// - name: uid
//   in: path
//   example: eacdae5b-4203-40a2-b388-969312ffcffe
//   description: uid
//   required: true
//   type: string
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (pc *GrafanaController) GrafanaGetDashboardAgainstUUID(c echo.Context) error {

	uuidDashboard := c.Param("uid")

	err := pc.GrafanaService.SetGrafanaObject()
	if err != nil {
		logrus.Error("Grafana service is not configured")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}

	responseData, err := pc.GrafanaService.GrafanaGetDashboardByUUUID(uuidDashboard)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /api/v3/proxy/grafana/search/:uid search
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
func (pc *GrafanaController) GrafanaGetFoldersAgainstUUID(c echo.Context) error {

	uuidDashboard := c.Param("uid")

	err := pc.GrafanaService.SetGrafanaObject()
	if err != nil {
		logrus.Error("Grafana service is not configured")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}

	responseData, err := pc.GrafanaService.GrafanaGetFoldersdByUUUID(uuidDashboard)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}
