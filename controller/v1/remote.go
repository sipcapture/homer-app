package controllerv1

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sirupsen/logrus"
)

type RemoteController struct {
	Controller
	RemoteService *service.RemoteService
}

// swagger:route GET /search/remote/label remote remoteRemoteLabel
//
// Returns data based upon filtered json
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
// parameters:
// + name: server
//   in: query
//   description: url
//   required: true
//   type: string
// responses:
//   200: body:RemoteLabels
//   400: body:FailureResponse
func (pc *RemoteController) RemoteLabel(c echo.Context) error {

	if !pc.RemoteService.Active {
		logrus.Error("Loki service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Loki service is not enabled")
	}

	serverName := c.QueryParam("server")

	responseData, err := pc.RemoteService.RemoteLabels(serverName)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /search/remote/values remote remoteRemoteValues
//
// Returns data based upon filtered json
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
// parameters:
// + name: server
//   in: query
//   description: url
//   required: true
//   type: string
// + name: label
//   in: query
//   description: label
//   required: true
//   type: string
// responses:
//   200: body:RemoteValues
//   400: body:FailureResponse
func (pc *RemoteController) RemoteValues(c echo.Context) error {

	if !pc.RemoteService.Active {
		logrus.Error("Loki service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Loki service is not enabled")
	}

	serverName := c.QueryParam("server")
	label := c.QueryParam("label")

	responseData, err := pc.RemoteService.RemoteValues(serverName, label)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /search/remote/data remote remoteRemoteData
//
// Returns data based upon filtered json
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
// parameters:
// + name: Request
//   in: body
//   description: Request
//   required: true
//   type: RemoteRequest
// responses:
//   200: body:RemoteResponseData
//   400: body:FailureResponse
func (pc *RemoteController) RemoteData(c echo.Context) error {

	if !pc.RemoteService.Active {
		logrus.Error("Loki service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Loki service is not enabled")
	}

	remoteObject := model.RemoteObject{}

	if err := c.Bind(&remoteObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := pc.RemoteService.RemoteData(&remoteObject)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}
