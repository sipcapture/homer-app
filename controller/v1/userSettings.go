package controllerv1

import (
	"fmt"
	"net/http"
	"time"

	"github.com/Jeffail/gabs/v2"
	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/auth"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sirupsen/logrus"
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

	userName, isAdmin := auth.IsRequestAdmin(c)
	reply, err := usc.UserSettingsService.GetAll(userName, isAdmin)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, []byte(reply))
}

// swagger:operation POST /alias alias AddAlias
//
// Adds alias to system
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: aliasstruct
//   in: body
//   description: alias parameters
//   schema:
//     "$ref": "#/definitions/AliasStruct"
//   required: true
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   '200': body:UserLoginSuccessResponse
//   '401': body:UserLoginFailureResponse
func (usc *UserSettingsController) AddUserSettings(c echo.Context) error {

	userObject := model.TableUserSettings{}
	if err := c.Bind(&userObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	if userName, isAdmin := auth.IsRequestAdmin(c); !isAdmin {
		userObject.UserName = userName
	}

	row, _ := usc.UserSettingsService.Add(&userObject)
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, row)
}

// swagger:operation DELETE /alias/{guid} alias DeleteAlias
//
// Update an existing user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: guid
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: uuid of the alias to delete
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
//   '201': body:AliasStruct
func (usc *UserSettingsController) DeleteUserSettings(c echo.Context) error {

	userObject := model.TableUserSettings{}

	userObject.GUID = c.Param("guid")
	userName, isAdmin := auth.IsRequestAdmin(c)

	data, err := usc.UserSettingsService.Get(&userObject, userName, isAdmin)
	if err != nil {
		reply := gabs.New()
		reply.Set(userObject.GUID, "data")
		reply.Set(fmt.Sprintf("the userobject with id %s were not found", userObject.GUID), "message")
	}

	if err := usc.UserSettingsService.Delete(&userObject, userName, isAdmin); err != nil {
		reply := gabs.New()
		reply.Set(userObject.GUID, "data")
		reply.Set(fmt.Sprintf("the userobject with id %s were not found", userObject.GUID), "message")
	}

	reply := gabs.New()
	reply.Set(data.GUID, "data")
	reply.Set("successfully deleted userobject", "message")

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply.String())
}

// swagger:operation PUT /alias/{guid} alias UpdateAlias
//
// Update an existing user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: guid
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: uuid of the alias to update
//   required: true
//   type: string
// - name: area
//   in: body
//   description: area parameters
//   schema:
//     "$ref": "#/definitions/AliasStruct"
//   required: true
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   '201': body:AliasStruct
func (usc *UserSettingsController) UpdateUserSettings(c echo.Context) error {

	userObject := model.TableUserSettings{}

	if err := c.Bind(&userObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	// validate input request body
	if err := c.Validate(userObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	userObject.GUID = c.Param("guid")
	userName, isAdmin := auth.IsRequestAdmin(c)

	data, err := usc.UserSettingsService.Get(&userObject, userName, isAdmin)
	if err != nil {
		reply := gabs.New()
		reply.Set(userObject.GUID, "data")
		reply.Set(fmt.Sprintf("the userobject with id %s were not found", userObject.GUID), "message")
	}
	userObject.CreateDate = time.Now()
	userObject.Id = data.Id
	if err := usc.UserSettingsService.Update(&userObject, userName, isAdmin); err != nil {
		reply := gabs.New()
		reply.Set(userObject.GUID, "data")
		reply.Set(fmt.Sprintf("the userobject with id %s were not found", userObject.GUID), "message")
	}

	reply := gabs.New()
	reply.Set(data.GUID, "data")
	reply.Set("successfully updated alias", "message")

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply.String())
}
