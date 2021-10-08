package controllerv1

import (
	"net/http"

	"github.com/labstack/echo/v4"
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
// Security:
//  - JWT
//  - ApiKeyAuth
//
// SecurityDefinitions:
// JWT:
//      type: apiKey
//      name: Authorization
//      in: header
// ApiKeyAuth:
//      type: apiKey
//      in: header
//      name: Auth-Token
//
// responses:
//   201: body:HepsubSchema
//   400: body:FailureResponse
func (pc *ProfileController) GetDashboardList(c echo.Context) error {

	reply, err := pc.ProfileService.GetProfile()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.GetDashboardFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route GET /database/node/list profile profileGetDBNodeList
//
// Get mappings
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
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   201: body:NodeList
//   400: body:FailureResponse
func (pc *ProfileController) GetDBNodeList(c echo.Context) error {

	reply, err := pc.ProfileService.GetDBNodeList()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.GetDBNodeListFailed)
	}

	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}
