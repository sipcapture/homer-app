package controllerv1

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/url"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/config"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/migration/jsonschema"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sirupsen/logrus"
)

type DashBoardController struct {
	Controller
	DashBoardService *service.DashBoardService
}

// swagger:route GET /dashboard/info dashboard dashboardGetDashBoardLists
//
// Get all dashboards
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
//   200: body:DashboardElementList
//   400: body:FailureResponse
func (dbc *DashBoardController) GetDashBoardLists(c echo.Context) error {

	cc := c.(model.AppContext)
	username := cc.UserName
	reply, err := dbc.DashBoardService.GetDashBoardsLists(username)
	if err != nil {

		var dashboardHome []byte

		if config.Setting.DASHBOARD_SETTINGS.ExternalHomeDashboard != "" {
			dashboardHome, err = ioutil.ReadFile(config.Setting.DASHBOARD_SETTINGS.ExternalHomeDashboard) // just pass the file name
			if err != nil {
				dashboardHome = jsonschema.DashboardHome
			}
		} else {
			dashboardHome = jsonschema.DashboardHome
		}

		dbc.DashBoardService.InsertDashboardByName(username, "home", dashboardHome)
		dbc.DashBoardService.InsertDashboardByName(username, "smartsearch", jsonschema.DashboardSmartSearch)

		reply, err = dbc.DashBoardService.GetDashBoardsLists(username)
		if err != nil {
			return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.GetDashboardListFailed)
		}

	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route GET /dashboard/store/{dashboardId} dashboard dashboardGetDashBoard
//
// Get dashboard by param
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: dashboard ID
//   in: path
//   example: home
//   description: ID of dashboard
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
//   200: body:DashboardElement
//   400: body:FailureResponse
func (dbc *DashBoardController) GetDashBoard(c echo.Context) error {

	cc := c.(model.AppContext)
	username := cc.UserName

	dashboardID := c.Param("dashboardId")

	logrus.Println("*** Database Session created *** ")

	reply, err := dbc.DashBoardService.GetDashBoard(username, dashboardID)
	if err != nil {
		if dashboardID == "home" {

			var dashboardHome []byte

			if config.Setting.DASHBOARD_SETTINGS.ExternalHomeDashboard != "" {
				dashboardHome, err = ioutil.ReadFile(config.Setting.DASHBOARD_SETTINGS.ExternalHomeDashboard) // just pass the file name
				if err != nil {
					dashboardHome = jsonschema.DashboardHome
				}
			} else {
				dashboardHome = jsonschema.DashboardHome
			}

			_, err := dbc.DashBoardService.InsertDashboardByName(username, "homer", dashboardHome)
			if err != nil {
				return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.HomeDashboardNotExists)
			}

			dbc.DashBoardService.InsertDashboardByName(username, "smartsearch", jsonschema.DashboardSmartSearch)
			if err != nil {
				return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.HomeDashboardNotExists)
			}

			reply, err = dbc.DashBoardService.GetDashBoard(username, dashboardID)
			if err != nil {
				return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.DashboardNotExists)
			}

		} else {
			return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.DashboardNotExists)
		}
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route POST /dashboard/store/{dashboardId} dashboard dashboardInsertDashboard
//
// Add dashboard
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: dashboard ID
//   in: path
//   example: home
//   description: the ID of dashboard
//   required: true
//   type: string
// + name: dashboard data
//   in: body
//   schema:
//     type: DashboardElement
//   required: true
//   description: json of dashboard
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   200: body:SuccessResponse
//   400: body:FailureResponse
func (dbc *DashBoardController) InsertDashboard(c echo.Context) error {

	cc := c.(model.AppContext)
	username := cc.UserName
	dashboardId := url.QueryEscape(c.Param("dashboardId"))

	logrus.Println("*** Database Session created *** ")

	var jsonData map[string]interface{} = map[string]interface{}{}
	if err := c.Bind(&jsonData); err != nil {
		logrus.Println(err)
		return err
	}

	data, err := json.Marshal(jsonData)
	if err != nil {
		logrus.Println(err)
		return err
	}

	reply, err := dbc.DashBoardService.InsertDashboard(username, dashboardId, data)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.InsertDashboardFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route PUT /dashboard/store/{dashboardId} dashboard dashboardInsertDashboard
//
// Add dashboard
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: dashboard ID
//   in: path
//   example: home
//   description: the ID of dashboard
//   required: true
//   type: string
// + name: dashboard data
//   in: body
//   schema:
//     type: DashboardElement
//   required: true
//   description: json of dashboard
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   200: body:SuccessResponse
//   400: body:FailureResponse
func (dbc *DashBoardController) UpdateDashboard(c echo.Context) error {

	cc := c.(model.AppContext)
	username := cc.UserName
	dashboardId := url.QueryEscape(c.Param("dashboardId"))

	var jsonData map[string]interface{} = map[string]interface{}{}
	if err := c.Bind(&jsonData); err != nil {
		logrus.Println(err)
		return err
	}

	data, err := json.Marshal(jsonData)
	if err != nil {
		logrus.Println(err)
		return err
	}

	reply, err := dbc.DashBoardService.UpdateDashboard(username, dashboardId, data)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.InsertDashboardFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route DELETE /dashboard/store/{dashboardId} dashboard dashboardDeleteDashboard
//
// Delete dashboard
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: dashboard ID
//   in: path
//   example: home
//   description: the ID of dashboard
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
//   200: body:SuccessResponse
//   400: body:FailureResponse
func (dbc *DashBoardController) DeleteDashboard(c echo.Context) error {

	cc := c.(model.AppContext)
	username := cc.UserName
	dashboardId := url.QueryEscape(c.Param("dashboardId"))
	reply, err := dbc.DashBoardService.DeleteDashboard(username, dashboardId)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.DeleteDashboardFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}
