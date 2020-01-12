package controllerv1

import (
	"net/http"

	"github.com/labstack/echo"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
)

type ProfileController struct {
	Controller
	ProfileService *service.ProfileService
}

// swagger:route GET //mapping/protocol dashboard ListMapping
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
//   '201': body:UserCreateSuccessfulResponse
//   '400': body:UserCreateSuccessfulResponse
func (pc *ProfileController) GetHepsub(c echo.Context) error {

	reply, err := pc.ProfileService.GetProfile()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route GET //mapping/protocol dashboard ListMapping
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
//   '201': body:UserCreateSuccessfulResponse
//   '400': body:UserCreateSuccessfulResponse
func (pc *ProfileController) GetDashboardList(c echo.Context) error {

	reply, err := pc.ProfileService.GetProfile()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}
