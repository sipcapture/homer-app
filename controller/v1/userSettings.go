package controllerv1

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	"github.com/sipcapture/homer-app/data/service"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
)

type UserSettingsController struct {
	Controller
	UserSettingsService *service.UserSettingsService
}

// swagger:route GET /user/settings settings ListSettings
//
// Returns the list of settings
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
func (usc *UserSettingsController) GetAll(c echo.Context) error {

	fmt.Println("USER SETTINGS")

	reply, err := usc.UserSettingsService.GetAll()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, []byte(reply))
}
