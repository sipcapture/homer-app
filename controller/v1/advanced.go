package controllerv1

import (
	"net/http"
	"net/url"

	"github.com/labstack/echo/v4"
	uuid "github.com/satori/go.uuid"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sirupsen/logrus"
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

// swagger:route POST /advanced/protocol ListAdvancedSettings
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
func (ac *AdvancedController) AddAdvanced(c echo.Context) error {
	// Stub an user to be populated from the body
	u := model.TableGlobalSettings{}
	err := c.Bind(&u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// validate input request body
	if err := c.Validate(u); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}

	u.GUID = uuid.NewV4().String()
	reply, err := ac.AdvancedService.AddAdvanced(u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, []byte(reply))
}

// swagger:operation Delete /mapping/protocol/{guid} mapping DeleteMapping
//
// Get mapping against id and profile
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: id
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: guid of mapping
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
//   '201': body:UserCreateSuccessfulResponse
//   '400': body:UserCreateSuccessfulResponse
func (ac *AdvancedController) UpdateAdvancedAgainstGUID(c echo.Context) error {
	guid := url.QueryEscape(c.Param("guid"))
	reply, err := ac.AdvancedService.GetAdvancedAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// Stub an user to be populated from the body
	u := model.TableGlobalSettings{}
	err = c.Bind(&u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// validate input request body
	if err := c.Validate(u); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	u.GUID = guid
	reply, err = ac.AdvancedService.UpdateAdvancedAgainstGUID(guid, u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}

// swagger:operation Delete /mapping/protocol/{guid} mapping DeleteMapping
//
// Get mapping against id and profile
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: id
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: guid of mapping
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
//   '201': body:UserCreateSuccessfulResponse
//   '400': body:UserCreateSuccessfulResponse
func (ac *AdvancedController) DeleteAdvancedAgainstGUID(c echo.Context) error {
	guid := url.QueryEscape(c.Param("guid"))
	reply, err := ac.AdvancedService.GetAdvancedAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	reply, err = ac.AdvancedService.DeleteAdvancedAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}

// swagger:operation GET /mapping/protocol/{guid} mapping GetMapping
//
// Get mapping against id and profile
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: id
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: guid of mapping
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
//   '201': body:UserCreateSuccessfulResponse
//   '400': body:UserCreateSuccessfulResponse
func (ac *AdvancedController) GetAdvancedAgainstGUID(c echo.Context) error {

	guid := url.QueryEscape(c.Param("guid"))
	reply, err := ac.AdvancedService.GetAdvancedAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}
