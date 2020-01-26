package controllerv1

import (
	"net/http"
	"net/url"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/auth"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sirupsen/logrus"
)

type AgentsubController struct {
	Controller
	AgentsubService *service.AgentsubService
}

// swagger:route GET //mapping/protocol dashboard ListMapping
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
func (ass *AgentsubController) GetAgentsub(c echo.Context) error {

	reply, err := ass.AgentsubService.GetAgentsub()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route GET //mapping/protocol dashboard ListMapping
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
func (ass *AgentsubController) GetAgentsubByType(c echo.Context) error {
	typeRequest := url.QueryEscape(c.Param("type"))
	reply, err := ass.AgentsubService.GetAgentsubAgainstType(typeRequest)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route GET //mapping/protocol dashboard ListMapping
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
func (ass *AgentsubController) GetAgentsubAgainstGUID(c echo.Context) error {
	guid := url.QueryEscape(c.Param("guid"))
	reply, err := ass.AgentsubService.GetAgentsubAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route POST /Agentsub/protocol Agentsub AddAgentsub
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
func (ass *AgentsubController) AddAgentsubWithKey(c echo.Context) error {
	// Stub an user to be populated from the body
	agentSub := model.TableAgentLocationSession{}
	err := c.Bind(&agentSub)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// validate input request body
	if err := c.Validate(agentSub); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}

	authToken := c.Request().Header.Get(auth.TokenHeader)
	if authToken == "" {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Auth-Token header not present or has empty value")
	}

	reply, err := ass.AgentsubService.GetAuthKeyByHeaderToken(authToken)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}

	reply, err = ass.AgentsubService.DeleteAgentsubAgainstGUID(agentSub.GUID)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}

	agentSub.CreateDate = time.Now()
	agentSub.ExpireDate = time.Now().Add(time.Duration(agentSub.TTL) * time.Second)
	agentSub.Active = 1

	reply, err = ass.AgentsubService.AddAgentsub(agentSub)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, []byte(reply))
}

// swagger:route GET //mapping/protocol dashboard ListMapping
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
func (ass *AgentsubController) UpdateAgentsubAgainstGUID(c echo.Context) error {
	guid := url.QueryEscape(c.Param("guid"))
	reply, err := ass.AgentsubService.GetAgentsubAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// Stub an user to be populated from the body
	u := model.TableAgentLocationSession{}
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
	reply, err = ass.AgentsubService.UpdateAgentsubAgainstGUID(guid, u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}

// swagger:route GET //mapping/protocol dashboard ListMapping
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
func (ass *AgentsubController) DeleteAgentsubAgainstGUID(c echo.Context) error {
	guid := url.QueryEscape(c.Param("guid"))

	reply, err := ass.AgentsubService.GetAgentsubAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	reply, err = ass.AgentsubService.DeleteAgentsubAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	reply, err = ass.AgentsubService.DeleteAgentsubAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}

// swagger:route GET //mapping/protocol dashboard ListMapping
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
func (ass *AgentsubController) GetAgentSearchByTypeAndGUID(c echo.Context) error {
	guid := url.QueryEscape(c.Param("guid"))
	//typeRequest := url.QueryEscape(c.Param("type"))

	reply, err := ass.AgentsubService.GetAgentsubAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}
