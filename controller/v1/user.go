package controllerv1

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/auth"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sipcapture/homer-app/utils/logger"
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
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   200: body:ListUsers
//   400: body:FailureResponse
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

// swagger:route POST /users user userCreateUser
//
// Create a New user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: CreateUserStruct
//   in: body
//   description: user structure
//   schema:
//     type: CreateUserStruct
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
//   201: body:UserCreateSuccessResponse
//   400: body:FailureResponse
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
// + name: userGuid
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: uuid of the user to update
//   required: true
//   type: string
// + name: createUserStruct
//   in: body
//   description: user parameters
//   schema:
//     "$ref": "#/definitions/CreateUserStruct"
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
//   201: body:UserUpdateSuccessResponse
//   400: body:FailureResponse
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
// + name: userGuid
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: uuid of the user to update
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
//   201: body:UserDeleteSuccessResponse
//   400: body:FailureResponse
func (uc *UserController) DeleteUser(c echo.Context) error {
	u := model.TableUser{}

	u.GUID = c.Param("userGuid")
	if err := uc.UserService.DeleteUser(&u); err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserCreationFailed)
	}
	response := fmt.Sprintf("{\"data\":\"%s\",\"message\":\"%s\"}", u.GUID, "successfully deleted user")
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, response)
}

// swagger:route POST /auth user auth userLoginUser
//
// Returns a JWT Token and UUID attached to user
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: userLoginStruct
//   in: body
//   description: user login structure
//   schema:
//      type: UserLogin
//   required: true
// responses:
//   201: body:UserLoginSuccessResponse
//   400: body:FailureResponse
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

	loginObject := model.UserTokenSuccessfulResponse{}
	loginObject.Token = token
	loginObject.Scope = userData.GUID
	loginObject.User.Admin = userData.IsAdmin
	response, _ := json.Marshal(loginObject)
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, response)
}

// swagger:route GET /auth/type/list Users SuccessResponse
//
// Returns data from server
// ---
// consumes:
// - application/json
// produces:
// - application/json
//  Security:
//   - JWT
//   - ApiKeyAuth
//
// SecurityDefinitions:
// JWT:
//      type: apiKey
//      name: Authorization
//      in: header
// ApiKeyAuth:
//      type: apiKey
//      in: header
//      name: Auth-Token
//
// responses:
//   200: body:SuccessResponse
//   400: body:FailureResponse
func (uc *UserController) GetAuthTypeList(c echo.Context) error {

	reply, err := uc.UserService.GetAuthTypeList()

	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "not possible")
	}

	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, reply)

}
