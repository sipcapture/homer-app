package controllerv1

import (
	"net/http"

	"github.com/labstack/echo"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/network/response"
)

type AdvancedController struct {
	Controller
	AdvancedService *service.AdvancedService
}

// swagger:route GET /advanced advanced ListAdvancedSettings
//
// Returns advanced setting of user
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
//   '200': body:AliasStruct
func (ac *AdvancedController) GetAll(c echo.Context) error {
	alias, _ := ac.AdvancedService.GetAll()
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, string(alias))
}
