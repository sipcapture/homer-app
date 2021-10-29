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
	"github.com/sipcapture/homer-app/utils/logger"
)

type UserSettingsController struct {
	Controller
	UserSettingsService *service.UserSettingsService
}

// swagger:route GET /user/settings settings settingsGetAll
//
// Returns the list of settings
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
//   200: body:UserSettingList
//   400: body:FailureResponse
func (usc *UserSettingsController) GetAll(c echo.Context) error {

	userName, isAdmin := auth.IsRequestAdmin(c)
	reply, err := usc.UserSettingsService.GetAll(userName, isAdmin)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserSettingsFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}

// swagger:route GET /user/settings/{category} settings settingsGetCategory
//
// Returns the list of settings
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: category
//   in: path
//   description: user settings category
//   example: dashboard
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
//   200: body:UserSettingList
//   400: body:FailureResponse
func (usc *UserSettingsController) GetCategory(c echo.Context) error {

	userCategory := c.Param("category")
	userName, _ := auth.IsRequestAdmin(c)
	reply, _ := usc.UserSettingsService.GetCategory(userName, userCategory)
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}

// swagger:route POST /user/settings settings settingsAddUserSettings
//
// Adds user settings
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: UserSetting
//   in: body
//   description: UserSetting struct
//   schema:
//     type: UserSetting
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
//   201: body:UserSettingCreateSuccessfulResponse
//   400: body:FailureResponse
func (usc *UserSettingsController) AddUserSettings(c echo.Context) error {

	userObject := model.TableUserSettings{}
	if err := c.Bind(&userObject); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	if userName, isAdmin := auth.IsRequestAdmin(c); !isAdmin {
		userObject.UserName = userName
	}

	row, _ := usc.UserSettingsService.Add(&userObject)
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, row)
}

// swagger:route DELETE /user/settings/{guid} settings settingsDeleteUserSettings
//
// Delete user settings
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: guid
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: guid of user settings
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
//   201: body:UserSettingDeleteSuccessfulResponse
// 	 400: body:FailureResponse
func (usc *UserSettingsController) DeleteUserSettings(c echo.Context) error {

	userObject := model.TableUserSettings{}

	userObject.GUID = c.Param("category")
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

// swagger:route PUT /user/settings/{guid} settings settingsUpdateUserSettings
//
// Update user settings
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: guid
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: guid of user settings
//   required: true
//   type: string
// + name: UserSetting
//   in: body
//   description: UserSetting
//   schema:
//     type: UserSetting
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
//   201: body:UserSettingUpdateSuccessfulResponse
// 	 400: body:FailureResponse
func (usc *UserSettingsController) UpdateUserSettings(c echo.Context) error {

	userObject := model.TableUserSettings{}

	if err := c.Bind(&userObject); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	// validate input request body
	if err := c.Validate(userObject); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	userObject.GUID = c.Param("category")
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
