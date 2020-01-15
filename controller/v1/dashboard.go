package controllerv1

import (
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sirupsen/logrus"
)

type DashBoardController struct {
	Controller
	DashBoardService *service.DashBoardService
}

// swagger:operation GET /dashboard/info/{username} dashboard Listdashboard
//
// Update an existing user
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
func (dbc *DashBoardController) GetDashBoardLists(c echo.Context) error {

	cc := c.(model.AppContext)
	username := cc.UserName
	reply, err := dbc.DashBoardService.GetDashBoardsLists(username)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:operation GET /dashboard/store/{dashboardId} dashboard Listdashboard
//
// Update an existing user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: dashboardid
//   in: path
//   example: admin
//   description: the dashboard id
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
func (dbc *DashBoardController) GetDashBoard(c echo.Context) error {

	cc := c.(model.AppContext)
	username := cc.UserName
	dashboardId := c.Param("dashboardId")

	logrus.Println("*** Database Session created *** ")

	reply, err := dbc.DashBoardService.GetDashBoard(username, dashboardId)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:operation POST /dashboard/store/{dashboardId} dashboard Listdashboard
//
// Update an existing user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: dashboardid
//   in: path
//   example: admin
//   description: the dashboard id
//   required: true
//   type: string
// - name: data
//   in: body
//   description: json of dashboard
//   schema:
//     "$ref": "#/definitions/CreateUserStruct"
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

	//data := types.JSONText(string(jsonString))
	//logrus.Println(string(data))
	//logrus.Println("-----------------------------")

	reply, err := dbc.DashBoardService.InsertDashboard(username, dashboardId, data)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:operation DELETE /dashboard/store/{dashboardId} dashboard DeleteDashboard
//
// Update an existing user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: dashboardid
//   in: path
//   example: admin
//   description: the dashboard id
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
func (dbc *DashBoardController) DeleteDashboard(c echo.Context) error {

	cc := c.(model.AppContext)
	username := cc.UserName
	dashboardId := url.QueryEscape(c.Param("dashboardId"))
	reply, err := dbc.DashBoardService.DeleteDashboard(username, dashboardId)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}
