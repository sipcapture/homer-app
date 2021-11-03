package controllerv1

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sipcapture/homer-app/utils/logger"
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
		logger.Error("Loki service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Loki service is not enabled")
	}

	serverName := c.QueryParam("server")

	responseData, err := pc.RemoteService.RemoteLabels(serverName)
	if err != nil {
		logger.Debug(responseData)
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
		logger.Error("Loki service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Loki service is not enabled")
	}

	serverName := c.QueryParam("server")
	label := c.QueryParam("label")

	responseData, err := pc.RemoteService.RemoteValues(serverName, label)
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route POST /search/remote/data remote remoteRemoteData
//
// Returns data based upon filtered json
// ---
// produces:
// - application/json
// parameters:
// + name: RemoteObject
//   in: body
//   description: RemoteObject parameters
//   schema:
//      type: RemoteObject
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
//   200: body:RemoteResponseData
//   400: body:FailureResponse
func (pc *RemoteController) RemoteData(c echo.Context) error {

	if !pc.RemoteService.Active {
		logger.Error("Loki service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Loki service is not enabled")
	}

	remoteObject := model.RemoteObject{}

	if err := c.Bind(&remoteObject); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := pc.RemoteService.RemoteData(&remoteObject)
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}
