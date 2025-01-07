package controllerv1

import (
	"net/http"
	"net/url"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sipcapture/homer-app/utils/logger"
)

type AdvancedController struct {
	Controller
	AdvancedService *service.AdvancedService
}

// swagger:route GET /advanced Advanced ListAdvancedSettings
//
// Returns advanced setting of user
// ---
// produces:
// - application/json
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
//	201: body:GlobalSettingsStructList
//	400: body:FailureResponse
func (ac *AdvancedController) GetAll(c echo.Context) error {
	alias, _ := ac.AdvancedService.GetAll()
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, string(alias))
}

// swagger:route POST /advanced Advanced advancedAddAdvanced
//
// Add advanced item
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
//	201: body:GlobalSettingsCreateSuccessfulResponse
//	400: body:FailureResponse
func (ac *AdvancedController) AddAdvanced(c echo.Context) error {
	// Stub an user to be populated from the body
	u := model.TableGlobalSettings{}
	err := c.Bind(&u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// validate input request body
	if err := c.Validate(u); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}

	u.GUID = heputils.GenereateNewUUID()
	reply, err := ac.AdvancedService.AddAdvanced(u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, []byte(reply))
}

// swagger:route PUT /advanced/{guid} Advanced advancedUpdateAdvancedAgainstGUID
//
// Update advanced item by guid
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
//   - name: guid
//     in: path
//     example: 11111111-1111-1111-1111-111111111111
//     description: guid of item
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
//	201: body:GlobalSettingsUpdateSuccessfulResponse
//	400: body:FailureResponse
func (ac *AdvancedController) UpdateAdvancedAgainstGUID(c echo.Context) error {
	guid, err := url.QueryUnescape(c.Param("guid"))
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
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
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	u.GUID = guid
	reply, err = ac.AdvancedService.UpdateAdvancedAgainstGUID(guid, u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}

// swagger:route DELETE /advanced/{guid} Advanced advancedDeleteAdvancedAgainstGUID
//
// Delete advanced item by guid
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
//   - name: guid
//     in: path
//     example: 11111111-1111-1111-1111-111111111111
//     description: guid of item
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
//	201: body:GlobalSettingsDeleteSuccessfulResponse
//	400: body:FailureResponse
func (ac *AdvancedController) DeleteAdvancedAgainstGUID(c echo.Context) error {
	guid, err := url.QueryUnescape(c.Param("guid"))
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	reply, err := ac.AdvancedService.GetAdvancedAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	reply, err = ac.AdvancedService.DeleteAdvancedAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.DeleteAdvancedAgainstFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}

// swagger:route GET /advanced/{guid} Advanced advancedGetAdvancedAgainstGUID
//
// Get advanced item by guid
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
//   - name: guid
//     in: path
//     example: 11111111-1111-1111-1111-111111111111
//     description: guid of item
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
//	201: body:GlobalSettingsStruct
//	400: body:FailureResponse
func (ac *AdvancedController) GetAdvancedAgainstGUID(c echo.Context) error {

	guid, err := url.QueryUnescape(c.Param("guid"))
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	reply, err := ac.AdvancedService.GetAdvancedAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.GetAdvancedAgainstFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}
