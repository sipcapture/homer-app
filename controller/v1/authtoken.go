package controllerv1

import (
	"net/http"
	"net/url"
	"time"

	"github.com/labstack/echo/v4"
	uuid "github.com/satori/go.uuid"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/migration/jsonschema"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sirupsen/logrus"
)

type AuthtokenController struct {
	Controller
	AuthtokenService *service.AuthtokenService
}

// swagger:route GET /token/auth token authTokenGetAuthtoken
//
// Get all tokens
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
//   200: body:AuthTokenList
//   400: body:FailureResponse
func (ass *AuthtokenController) GetAuthtoken(c echo.Context) error {

	reply, err := ass.AuthtokenService.GetAuthtoken()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.GetAuthTokenFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route GET /token/auth/{guid} token authTokenGetAuthtokenAgainstGUID
//
// Get token by guid
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: guid
//   in: path
//   example: eacdae5b-4203-40a2-b388-969312ffcffe
//   description: guid of token
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
//   200: body:AuthToken
//   400: body:FailureResponse
func (ass *AuthtokenController) GetAuthtokenAgainstGUID(c echo.Context) error {
	guid := url.QueryEscape(c.Param("guid"))
	reply, err := ass.AuthtokenService.GetAuthtokenAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))

}

// swagger:route POST /token/auth token authTokenAddAuthToken
//
// Add token
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: authTokenStruct
//   in: body
//   description: authToken parameters
//   schema:
//     type: AuthToken
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
//   201: body:AuthTokenCreateSuccessfulResponse
//   400: body:FailureResponse
func (ass *AuthtokenController) AddAuthtoken(c echo.Context) error {
	// Stub an user to be populated from the body
	u := model.TableAuthToken{}
	err := c.Bind(&u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// validate input request body
	if err := c.Validate(u); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}

	/*
		u.Token = heputils.GenerateToken()
		uid := uuid.NewV4()
		u.GUID = uid.String()
	*/
	uid := uuid.NewV4()
	u.GUID = uid.String()
	u.UserGUID = uid.String()
	u.Token = heputils.GenerateToken()
	u.UserObject = jsonschema.AgentObjectforAuthToken
	u.IPAddress = "0.0.0.0/0"
	u.CreateDate = time.Now()
	u.LastUsageDate = time.Now()
	reply, err := ass.AuthtokenService.AddAuthtoken(u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, []byte(reply))
}

// swagger:route PUT /token/auth/{guid} token authTokenUpdateAuthtokenAgainstGUID
//
// Update token by guid
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: guid
//   in: path
//   example: f4e2953e-ab42-40df-a7de-9ceb7faca396
//   description: guid of token
//   required: true
//   type: string
// + name: authTokenStruct
//   in: body
//   description: authToken parameters
//   schema:
//     type: AuthToken
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
//   201: body:AuthTokenUpdateSuccessfulResponse
//   400: body:FailureResponse
func (ass *AuthtokenController) UpdateAuthtokenAgainstGUID(c echo.Context) error {
	guid := url.QueryEscape(c.Param("guid"))
	reply, err := ass.AuthtokenService.GetAuthtokenAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// Stub an user to be populated from the body
	u := model.TableAuthToken{}
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
	u.LastUsageDate = time.Now()
	reply, err = ass.AuthtokenService.UpdateAuthtokenAgainstGUID(guid, u)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}

// swagger:route DELETE /token/auth/{guid} token authTokenDeleteAuthtokenAgainstGUID
//
// Delete token by guid
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: guid
//   in: path
//   example: f4e2953e-ab42-40df-a7de-9ceb7faca396
//   description: guid of token
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
//   201: body:AuthTokenDeleteSuccessfulResponse
//   400: body:FailureResponse
func (ass *AuthtokenController) DeleteAuthtokenAgainstGUID(c echo.Context) error {
	guid := url.QueryEscape(c.Param("guid"))

	reply, err := ass.AuthtokenService.GetAuthtokenAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	reply, err = ass.AuthtokenService.DeleteAuthtokenAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	reply, err = ass.AuthtokenService.DeleteAuthtokenAgainstGUID(guid)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}
