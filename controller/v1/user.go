package controllerv1

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/auth"
	"github.com/sipcapture/homer-app/config"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sipcapture/homer-app/utils/logger"
	"golang.org/x/oauth2"
)

type UserController struct {
	Controller
	UserService *service.UserService
}

// swagger:route GET /users user userGetUser
//
// Returns the list of Users
// ---
// produces:
// - application/json
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	200: body:ListUsers
//	400: body:FailureResponse
func (uc *UserController) GetUser(c echo.Context) error {

	userName, isAdmin := auth.IsRequestAdmin(c)

	user, count, err := uc.UserService.GetUser(userName, isAdmin)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}

	data := model.GetUser{}
	data.Count = count
	data.Data = user
	uj, _ := json.Marshal(data)
	//response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, uj)
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, uj)

}

// swagger:route GET /users/{userGuid} user userGetUser
//
// Returns the list of Users
// ---
// produces:
// - application/json
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	200: body:ListUsers
//	400: body:FailureResponse
func (uc *UserController) GetUserByGUID(c echo.Context) error {

	// Stub an user to be populated from the body
	GUID := c.Param("userGuid")
	userName, _ := auth.IsRequestAdmin(c)

	user, count, err := uc.UserService.GetUserByUUID(GUID, userName)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFailed)
	}

	data := model.GetUser{}
	data.Count = count
	data.Data = user
	uj, _ := json.Marshal(data)
	//response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, uj)
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, uj)

}

// swagger:route GET /users/groups Users groups
//
// Returns the list of groups
// ---
//
//	    Consumes:
//	    - application/json
//
//		   Produces:
//		   - application/json
//
//		   Security:
//		   - JWT
//
// SecurityDefinitions:
// JWT:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// ApiKeyAuth:
//
//	type: apiKey
//	in: header
//	name: Auth-Token
//
// Responses:
//
//	201: body:ListUsers
//	400: body:FailureResponse
func (uc *UserController) GetGroups(c echo.Context) error {

	reply, err := uc.UserService.GetGroups()
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserSettingsFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}

// swagger:route POST /users user userCreateUser
//
// Create a New user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
//   - name: CreateUserStruct
//     in: body
//     description: user structure
//     schema:
//     type: CreateUserStruct
//     required: true
//
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	201: body:UserCreateSuccessResponse
//	400: body:FailureResponse
func (uc *UserController) CreateUser(c echo.Context) error {

	// Stub an user to be populated from the body
	u := model.TableUser{}
	if err := c.Bind(&u); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	// validate input request body
	if err := c.Validate(u); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// create a new user in database
	if err := uc.UserService.CreateNewUser(&u); err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserCreationFailed)
	}
	oj := model.UserCreateSuccessfulResponse{}
	oj.Data = u.GUID
	oj.Message = webmessages.SuccessfullyCreatedUser
	response, _ := json.Marshal(oj)
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, response)
}

// swagger:route PUT /users/{userGuid} user userUpdateUser
//
// Update an existing user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
//   - name: userGuid
//     in: path
//     example: 11111111-1111-1111-1111-111111111111
//     description: uuid of the user to update
//     required: true
//     type: string
//   - name: createUserStruct
//     in: body
//     description: user parameters
//     schema:
//     "$ref": "#/definitions/CreateUserStruct"
//     required: true
//
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	201: body:UserUpdateSuccessResponse
//	400: body:FailureResponse
func (uc *UserController) UpdateUser(c echo.Context) error {

	// Stub an user to be populated from the body
	u := model.TableUser{}
	u.GUID = c.Param("userGuid")
	userName, isAdmin := auth.IsRequestAdmin(c)

	if err := c.Bind(&u); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	// validate input request body
	if err := c.Validate(u); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// update user info in database
	if err := uc.UserService.UpdateUser(&u, userName, isAdmin); err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	response := fmt.Sprintf("{\"data\":\"%s\",\"message\":\"%s\"}", u.GUID, "successfully updated user")
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, response)
}

// swagger:route DELETE /users/{userGuid} user userDeleteUser
//
// Delete an existing User
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
//   - name: userGuid
//     in: path
//     example: 11111111-1111-1111-1111-111111111111
//     description: uuid of the user to update
//     required: true
//     type: string
//
// Security:
// - bearer: []
//
// SecurityDefinitions:
// bearer:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	201: body:UserDeleteSuccessResponse
//	400: body:FailureResponse
func (uc *UserController) DeleteUser(c echo.Context) error {
	u := model.TableUser{}

	u.GUID = c.Param("userGuid")
	if err := uc.UserService.DeleteUser(&u); err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserCreationFailed)
	}
	response := fmt.Sprintf("{\"data\":\"%s\",\"message\":\"%s\"}", u.GUID, "successfully deleted user")
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, response)
}

// swagger:route POST /auth user userLoginUser
//
// Returns a JWT Token and UUID attached to user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
//   - name: userLoginStruct
//     in: body
//     description: user login structure
//     schema:
//     type: UserLogin
//     required: true
//
// responses:
//
//	201: body:UserLoginSuccessResponse
//	400: body:FailureResponse
func (uc *UserController) LoginUser(c echo.Context) error {
	u := model.UserloginDetails{}
	if err := c.Bind(&u); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	// validate input request body
	if err := c.Validate(u); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	token, userData, err := uc.UserService.LoginUser(u.Username, u.Password)
	if err != nil {
		loginObject := model.UserTokenBadResponse{}
		loginObject.StatusCode = http.StatusUnauthorized
		loginObject.Message = webmessages.IncorrectPassword
		loginObject.Error = webmessages.Unauthorized
		response, _ := json.Marshal(loginObject)
		return httpresponse.CreateBadResponseWithJson(&c, http.StatusUnauthorized, response)
	}
	if !userData.Enabled {
		loginObject := model.UserTokenBadResponse{}
		loginObject.StatusCode = http.StatusUnauthorized
		loginObject.Message = webmessages.Unauthorized
		loginObject.Error = webmessages.Unauthorized
		response, _ := json.Marshal(loginObject)
		return httpresponse.CreateBadResponseWithJson(&c, http.StatusUnauthorized, response)
	}

	loginObject := model.UserTokenSuccessfulResponse{}
	loginObject.Token = token
	loginObject.Scope = userData.GUID
	loginObject.User.Admin = userData.IsAdmin
	response, _ := json.Marshal(loginObject)
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, response)
}

// swagger:route GET /auth/type/list user GetAuthTypeList
//
// Returns data from server
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
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	200: body:AuthTypeList
//	400: body:FailureResponse
func (uc *UserController) GetAuthTypeList(c echo.Context) error {

	reply, err := uc.UserService.GetAuthTypeList()

	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "not possible")
	}

	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, reply)

}

// swagger:route GET /oauth/redirect Users SuccessResponse
//
// Make redirect to the External Server URI
// ---
// consumes:
// - application/json
// produces:
//   - application/json
//     Security:
//   - JWT
//   - ApiKeyAuth
//
// SecurityDefinitions:
// JWT:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// ApiKeyAuth:
//
//	type: apiKey
//	in: header
//	name: Auth-Token
//
// responses:
//
//	200: body:SuccessResponse
//	400: body:FailureResponse
func (uc *UserController) RedirecToSericeAuth(c echo.Context) error {

	if !config.Setting.OAUTH2_SETTINGS.Enable {
		return httpresponse.CreateBadResponse(&c, http.StatusNotImplemented, "oauth2 is not enabled [1]")
	}

	providerName := c.Param("provider")

	logger.Debug("Doing URL for provider:", providerName)

	u := config.Setting.MAIN_SETTINGS.OAuth2Config.AuthCodeURL(config.Setting.OAUTH2_SETTINGS.StateValue,
		oauth2.SetAuthURLParam("response_type", config.Setting.OAUTH2_SETTINGS.ResponseType),
		oauth2.SetAuthURLParam("code_challenge", heputils.GenCodeChallengeS256(config.Setting.OAUTH2_SETTINGS.UserToken)),
		oauth2.SetAuthURLParam("code_challenge_method", "S256"))

	logger.Debug("RedirecToSericeAuth Redirecting URL :", u)

	return c.Redirect(http.StatusFound, u)
}

// swagger:route GET /oauth/auth Users SuccessResponse
//
// Make redirect to the External Server URI
// ---
// consumes:
// - application/json
// produces:
//   - application/json
//     Security:
//   - JWT
//   - ApiKeyAuth
//
// SecurityDefinitions:
// JWT:
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// ApiKeyAuth:
//
//	type: apiKey
//	in: header
//	name: Auth-Token
//
// responses:
//
//	200: body:SuccessResponse
//	400: body:FailureResponse
func (uc *UserController) AuthSericeRequest(c echo.Context) error {

	if !config.Setting.OAUTH2_SETTINGS.Enable {
		return httpresponse.CreateBadResponse(&c, http.StatusNotImplemented, "oauth2 is not enabled [2]")
	}

	providerName := c.Param("provider")
	logger.Debug("Doing AuthSericeRequest for provider: ", providerName)

	state := c.QueryParam("state")
	if state != config.Setting.OAUTH2_SETTINGS.StateValue {
		logger.Error("AuthSericeRequest state is invalid!")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "State invalid")
	}

	code := c.QueryParam("code")
	if code == "" {
		logger.Error("AuthSericeRequest code is invalid!")
		return httpresponse.CreateBadResponse(&c, http.StatusInternalServerError, "Code not found")
	}

	oAuth2Object := model.OAuth2MapToken{}
	options := []oauth2.AuthCodeOption{}
	redirecturi := config.Setting.OAUTH2_SETTINGS.RedirectUri + "/" + config.Setting.OAUTH2_SETTINGS.ServiceProviderName

	if config.Setting.OAUTH2_SETTINGS.AuthStyle == 1 {
		options = append(options,
			oauth2.SetAuthURLParam("grant_type", config.Setting.OAUTH2_SETTINGS.GrantType),
			oauth2.SetAuthURLParam("code", code),
			oauth2.SetAuthURLParam("redirect_uri", redirecturi),
			oauth2.SetAuthURLParam("client_secret", config.Setting.OAUTH2_SETTINGS.ClientSecret),
			oauth2.SetAuthURLParam("client_id", config.Setting.OAUTH2_SETTINGS.ClientID))
	}

	options = append(options, oauth2.SetAuthURLParam("code_verifier", config.Setting.OAUTH2_SETTINGS.UserToken))
	logger.Debug("Options for token exchange in AuthSericeRequest : ", options)

	token, err := config.Setting.MAIN_SETTINGS.OAuth2Config.Exchange(context.Background(), code, options...)
	if err != nil {
		logger.Error("AuthSericeRequest OAuth2Config Exchange is invalid:", err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusInternalServerError, err.Error())
	}

	//scope := c.QueryParam("scope")
	tokenSource := config.Setting.MAIN_SETTINGS.OAuth2Config.TokenSource(context.Background(), token)

	client := oauth2.NewClient(context.Background(), tokenSource)

	if config.Setting.OAUTH2_SETTINGS.Method == "POST" {
		resp, err := client.Post(config.Setting.OAUTH2_SETTINGS.ProfileURL, "application/x-www-form-urlencoded", bytes.NewReader([]byte("")))
		if err == nil {
			defer resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				bodyBytes, err := ioutil.ReadAll(resp.Body)
				if err != nil {
					logger.Error("post couldn't read the body for email: ", err.Error())
					return httpresponse.CreateBadResponse(&c, http.StatusInternalServerError, err.Error())
				} else {
					oAuth2Object.ProfileJson = bodyBytes
				}
			} else {
				logger.Error("post couldn't get profile error code: ", resp.StatusCode)
				return httpresponse.CreateBadResponse(&c, http.StatusInternalServerError, fmt.Sprintf("couldn't retrieve user profile [%d]", resp.StatusCode))
			}
		} else {
			logger.Error("post couldn't get data: ", err.Error())
			return httpresponse.CreateBadResponse(&c, http.StatusInternalServerError, err.Error())
		}
	} else {

		resp, err := client.Get(config.Setting.OAUTH2_SETTINGS.ProfileURL)
		if err == nil {
			defer resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				bodyBytes, err := ioutil.ReadAll(resp.Body)
				if err != nil {
					logger.Error("couldn't read the body for email: ", err.Error())
					return httpresponse.CreateBadResponse(&c, http.StatusInternalServerError, err.Error())
				} else {
					oAuth2Object.ProfileJson = bodyBytes
				}
			} else {
				logger.Error("post couldn't get profile error code: ", resp.StatusCode)
				return httpresponse.CreateBadResponse(&c, http.StatusInternalServerError, fmt.Sprintf("couldn't retrieve user profile [%d]", resp.StatusCode))
			}
		} else {
			logger.Error("couldn't get data: ", err.Error())
			return httpresponse.CreateBadResponse(&c, http.StatusInternalServerError, err.Error())
		}

	}

	ssoToken := heputils.GenerateToken()
	oAuth2Object.Oauth2Token = token
	oAuth2Object.CreateDate = time.Now()
	oAuth2Object.ExpireDate = time.Now().Add(time.Duration(config.Setting.OAUTH2_SETTINGS.ExpireSSOToken) * time.Minute)
	logger.Debug("AuthSericeRequest GenerateToken: ", ssoToken)

	config.OAuth2TokenMap[ssoToken] = oAuth2Object

	//c.Response().Header().Add("Authorization", "Bearer "+token.AccessToken)
	return c.Redirect(http.StatusFound, config.Setting.OAUTH2_SETTINGS.UrlToService+"?token="+ssoToken)

}

// swagger:route POST /oauth2/token user auth userLoginUser
//
// Returns a JWT Token and UUID attached to user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
//   - name: userLoginStruct
//     in: body
//     description: user login structure
//     schema:
//     type: UserLogin
//     required: true
//
// responses:
//
//	201: body:UserLoginSuccessResponse
//	400: body:FailureResponse
func (uc *UserController) Oauth2TokenExchange(c echo.Context) error {

	logger.Debug("Doing Oauth2TokenExchange....")

	if !config.Setting.OAUTH2_SETTINGS.Enable {
		return httpresponse.CreateBadResponse(&c, http.StatusNotImplemented, "oauth2 is not enabled [3]")
	}

	u := model.OAuth2TokenExchange{}
	if err := c.Bind(&u); err != nil {
		logger.Error("Doing Oauth2TokenExchange....", err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	// validate input request body
	if err := c.Validate(u); err != nil {
		logger.Error("Doing Validate....", err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}

	if oAuth2Object, ok := config.OAuth2TokenMap[u.OneTimeToken]; ok {

		if oAuth2Object.ExpireDate.Before(time.Now()) {
			logger.Error("key has been expired: ", u.OneTimeToken)
			return httpresponse.CreateBadResponse(&c, http.StatusNotFound, "key has been expired")
		}

		token, userData, err := uc.UserService.LoginUserUsingOauthToken(oAuth2Object)
		if err != nil {
			loginObject := model.UserTokenBadResponse{}
			loginObject.StatusCode = http.StatusUnauthorized
			loginObject.Message = webmessages.IncorrectPassword
			loginObject.Error = webmessages.Unauthorized
			response, _ := json.Marshal(loginObject)
			logger.Error("LoginUserUsingOauthToken is unauth: ", u.OneTimeToken)
			return httpresponse.CreateBadResponseWithJson(&c, http.StatusUnauthorized, response)
		}

		loginObject := model.UserTokenSuccessfulResponse{}
		loginObject.Token = token
		loginObject.Scope = userData.GUID
		loginObject.User.Admin = userData.IsAdmin
		response, _ := json.Marshal(loginObject)
		return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, response)
	} else {
		logger.Error("key not found: ", u.OneTimeToken)
		return httpresponse.CreateBadResponse(&c, http.StatusNotFound, "key not found or has been expired")
	}

}

// swagger:route GET /user/profile settings settingsGetAll
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
//
//	type: apiKey
//	name: Authorization
//	in: header
//
// responses:
//
//	200: body:UserSettingList
//	400: body:FailureResponse
func (uc *UserController) GetCurrentUserProfile(c echo.Context) error {

	userProfile, err := auth.GetUserProfile(c)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserProfileFailed)
	}

	reply, err := uc.UserService.GetUserProfileFromToken(userProfile)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserSettingsFailed)
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
}
