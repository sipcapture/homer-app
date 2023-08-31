package controllerv1

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/data/service"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/utils/logger"
)

type GrafanaController struct {
	Controller
	GrafanaService *service.GrafanaService
}

// swagger:route GET /proxy/grafana/path proxy grafanaGrafanaPath
//
// Returns Grafana Proxy Path
// ---
// produces:
// - application/json
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	200: body:GrafanaUrl
//	400: body:FailureResponse
func (pc *GrafanaController) GrafanaPath(c echo.Context) error {

	responseData, err := pc.GrafanaService.GrafanaPath()
	if err != nil {
		logger.Debug(responseData)
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /proxy/grafana/url proxy grafanaGrafanaURL
//
// Returns Grafana Proxy Url
// ---
// produces:
// - application/json
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	200: body:GrafanaUrl
//	400: body:FailureResponse
func (pc *GrafanaController) GrafanaURL(c echo.Context) error {

	responseData, err := pc.GrafanaService.GrafanaURL()
	if err != nil {
		logger.Debug(responseData)
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /proxy/grafana/status Proxy grafana
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// Security:
// - JWT
//
// SecurityDefinitions:
// JWT:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// ApiKeyAuth:
//
//	type: apiKey
//	in: header
//	name: Auth-Token
//
// Responses:
//
//	201: body:ListUsers
//	400: body:FailureResponse
func (pc *GrafanaController) GrafanaStatus(c echo.Context) error {

	responseData, err := pc.GrafanaService.GrafanaStatus()
	if err != nil {
		logger.Error("GrafanaURL: ", responseData)
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /proxy/grafana/org proxy grafanaGrafanaORG
//
// Returns data about Grafana organization
// ---
// produces:
// - application/json
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	200: body:GrafanaOrg
//	400: body:UserLoginFailureResponse
func (pc *GrafanaController) GrafanaORG(c echo.Context) error {

	err := pc.GrafanaService.SetGrafanaObject()
	if err != nil {
		logger.Error("Grafana service is not configured")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}

	responseData, err := pc.GrafanaService.GrafanaORG()
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /proxy/grafana/folders proxy grafanaGrafanaFolders
//
// Returns list of folders from Grafana
// ---
// produces:
// - application/json
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	200: body:GrafanaFolders
//	400: body:FailureResponse
func (pc *GrafanaController) GrafanaFolders(c echo.Context) error {

	err := pc.GrafanaService.SetGrafanaObject()
	if err != nil {
		logger.Error("Grafana service is not configured")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}

	responseData, err := pc.GrafanaService.GrafanaFolders()
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /proxy/grafana/dashboards/uid/{uid} proxy grafanaGrafanaGetDashboardAgainstUUID
//
// Returns dashboard from Grafana with specific UID
// ---
// produces:
// - application/json
// parameters:
//   - name: uid
//     in: path
//     example: 9Aklz9aGz
//     description: uid
//     required: true
//     type: string
//
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	200: body:GrafanaResponseValue
//	400: body:FailureResponse
func (pc *GrafanaController) GrafanaGetDashboardAgainstUUID(c echo.Context) error {

	uuidDashboard := c.Param("uid")

	err := pc.GrafanaService.SetGrafanaObject()
	if err != nil {
		logger.Error("Grafana service is not configured")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}

	responseData, err := pc.GrafanaService.GrafanaGetDashboardByUUUID(uuidDashboard)
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /proxy/grafana/search/{uid} proxy GrafanaGetFoldersAgainstUUID
//
// Returns Grafana folder based on UID
// ---
// produces:
// - application/json
// Security:
// - bearer
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// parameters:
//   - name: uid
//     in: path
//     example: 9Aklz9aGz
//     description: uid
//     required: true
//     type: string
//
// responses:
//
//	200: body:ListUsers
//	400: body:FailureResponse
func (pc *GrafanaController) GrafanaGetFoldersAgainstUUID(c echo.Context) error {

	uuidDashboard := c.Param("uid")

	err := pc.GrafanaService.SetGrafanaObject()
	if err != nil {
		logger.Error("Grafana service is not configured")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Grafana service is not configured")
	}

	responseData, err := pc.GrafanaService.GrafanaGetFoldersdByUUUID(uuidDashboard)
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /proxy/grafana/request/d/{uid}/{param} Proxy grafanaRequest
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// Security:
// - JWT
//
// SecurityDefinitions:
// JWT:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// ApiKeyAuth:
//
//	type: apiKey
//	in: header
//	name: Auth-Token
//
// Responses:
//
//	201: body:ListUsers
//	400: body:FailureResponse
func (pc *GrafanaController) GrafanaGetDashboardRequest(c echo.Context) error {

	requestDashboard := c.Param("uid")
	requestID := c.Param("param")
	queryString := c.QueryString()

	err := pc.GrafanaService.SetGrafanaObject()
	if err != nil {
		logger.Error("Grafana service is not configured")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "No Grafana service is not configured")
	}

	responseData, err := pc.GrafanaService.GrafanaGetDashboardRequest(requestDashboard, requestID, queryString)
	if err != nil {
		logger.Error("GrafanaGetFoldersAgainstUUID", responseData)
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "No Grafana service is not configured")
	}

	return c.HTML(http.StatusOK, responseData)

}
