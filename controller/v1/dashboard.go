package controllerv1

import (
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/labstack/echo/v4"
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
//   '200': body:DashboardElements
//   '400': body:FailureResponse
func (dbc *DashBoardController) GetDashBoardLists(c echo.Context) error {

	cc := c.(model.AppContext)
	username := cc.UserName
	reply, err := dbc.DashBoardService.GetDashBoardsLists(username)
	if err != nil {
		dbc.DashBoardService.InsertDashboard(username, "home", jsonschema.DashboardHome)
		reply, err = dbc.DashBoardService.GetDashBoardsLists(username)
		if err != nil {
			return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.GetDashboardListFailed)
		}
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:operation GET /dashboard/store/{dashboardId} dashboard dashboardGetDashBoard
//
// Get dashboard by param
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: dashboard param
//   in: path
//   example: home
//   description: param of dashboard
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
//   '200': body:UserSettings
//   '400': body:FailureResponse
func (dbc *DashBoardController) GetDashBoard(c echo.Context) error {

	cc := c.(model.AppContext)
	username := cc.UserName

	dashboardID := c.Param("dashboardId")

	logrus.Println("*** Database Session created *** ")

	reply, err := dbc.DashBoardService.GetDashBoard(username, dashboardID)
	if err != nil {
		if dashboardID == "home" {
			_, err := dbc.DashBoardService.InsertDashboard(username, dashboardID, jsonschema.DashboardHome)
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

// swagger:operation POST /dashboard/store/{dashboardId} dashboard dashboardInsertDashboard
//
// Add dashboard
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: dashboard param
//   in: path
//   example: home
//   description: the param of dashboard
//   required: true
//   type: string
// - name: dashboard data
//   in: body
//   schema:
//     type: string
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
//   '200': body:UserSettings
//   '400': body:FailureResponse
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

// swagger:operation DELETE /dashboard/store/{dashboardId} dashboard dashboardDeleteDashboard
//
// Delete dashboard
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: dashboard param
//   in: path
//   example: home
//   description: the param of dashboard
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
//   '200': body:SuccessResponse
//   '400': body:FailureResponse
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
