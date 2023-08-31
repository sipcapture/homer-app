package controllerv1

import (
	"net/http"

	"github.com/Jeffail/gabs/v2"
	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/config"
	"github.com/sipcapture/homer-app/data/service"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
)

type ProfileController struct {
	Controller
	ProfileService *service.ProfileService
}

func (pc *ProfileController) GetHepsub(c echo.Context) error {

	reply, err := pc.ProfileService.GetProfile()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.MappingHepSubFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route GET /admin/profiles Admin ListProfiles
//
// Returns data from server
// ---
// consumes:
// - application/json
// produces:
// - application/json
// securityDefinitions:
//
//	bearer:
//	  type: apiKey
//	  in: header
//	  name: Authorization
//
// security:
//   - bearer: []
//
// responses:
//
//	201: body:HepsubSchema
//	400: body:FailureResponse
func (pc *ProfileController) GetDashboardList(c echo.Context) error {

	reply, err := pc.ProfileService.GetProfile()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.GetDashboardFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route GET /database/node/list profile profileGetDBNodeList
//
// Get list of DB nodes
// ---
// consumes:
// - application/json
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
//	201: body:NodeList
//	400: body:FailureResponse
func (pc *ProfileController) GetDBNodeList(c echo.Context) error {

	reply, err := pc.ProfileService.GetDBNodeList()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.GetDBNodeListFailed)
	}

	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route GET /modules/status Status ListMapping
//
// Returns data from server
// ---
// consumes:
// - application/json
// produces:
//   - application/json
//     Security:
//   - JWT
//   - ApiKeyAuth
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
//	201: body:SuccessResponse
//	400: body:FailureResponse
func (pc *ProfileController) GetModulesStatus(c echo.Context) error {

	moduleLoki := gabs.New()
	moduleLoki.Set(config.Setting.LOKI_CONFIG.Enable, "enable")
	moduleLoki.Set(config.Setting.LOKI_CONFIG.Template, "template")
	moduleLoki.Set(config.Setting.LOKI_CONFIG.ExternalUrl, "external_url")

	modulesResponse := gabs.New()
	modulesResponse.Set(moduleLoki.Data(), "loki")

	reply := gabs.New()
	reply.Set("Modules status", "message")
	reply.Set(modulesResponse.Data(), "data")

	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply.String()))

}
