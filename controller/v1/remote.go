package controllerv1

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
	"gitlab.com/qxip/webapp-go/data/service"
	"gitlab.com/qxip/webapp-go/model"
	httpresponse "gitlab.com/qxip/webapp-go/network/response"
	"gitlab.com/qxip/webapp-go/system/webmessages"
)

type RemoteController struct {
	Controller
	RemoteService *service.RemoteService
}

// swagger:route GET /api/v3/seach/remote/label search
//
// Returns data based upon filtered json
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
func (pc *RemoteController) RemoteLabel(c echo.Context) error {

	serverName := c.QueryParam("server")

	responseData, err := pc.RemoteService.RemoteLabels(serverName)
	if err != nil {
		fmt.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /api/v3/seach/remote/values search
//
// Returns data based upon filtered json
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
//   '200': body:ListValues
//   '400': body:UserLoginFailureResponse
func (pc *RemoteController) RemoteValues(c echo.Context) error {

	serverName := c.QueryParam("server")
	label := c.QueryParam("label")

	responseData, err := pc.RemoteService.RemoteValues(serverName, label)
	if err != nil {
		fmt.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /api/v3/seach/remote/data search
//
// Returns data based upon filtered json
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
//   '200': body:ListValues
//   '400': body:UserLoginFailureResponse
func (pc *RemoteController) RemoteData(c echo.Context) error {

	remoteObject := model.RemoteObject{}

	if err := c.Bind(&remoteObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := pc.RemoteService.RemoteData(&remoteObject)
	if err != nil {
		fmt.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}
