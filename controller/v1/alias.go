package controllerv1

import (
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/Jeffail/gabs/v2"
	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sirupsen/logrus"
)

type AliasController struct {
	Controller
	AliasService *service.AliasService
}

// swagger:operation POST /alias alias aliasAddAlias
//
// Add alias
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: aliasstruct
//   in: body
//   description: alias parameters
//   schema:
//     "$ref": "#/definitions/AliasStruct"
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
//   '200': body:UserLoginSuccessResponse
//   '401': body:UserLoginFailureResponse
func (alc *AliasController) AddAlias(c echo.Context) error {

	aliasObject := model.TableAlias{}
	if err := c.Bind(&aliasObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	// validate input request body
	if err := c.Validate(aliasObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}

	row, _ := alc.AliasService.Add(&aliasObject)
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, row)
}

// swagger:operation DELETE /alias/{guid} alias aliasDeleteAlias
//
// Delete alias
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: guid
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: guid of the alias
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
//   '201': body:AliasStruct
func (als *AliasController) DeleteAlias(c echo.Context) error {

	aliasObject := model.TableAlias{}
	aliasObject.GUID = c.Param("guid")
	data, err := als.AliasService.Get(&aliasObject)
	if err != nil {
		reply := gabs.New()
		reply.Set(aliasObject.GUID, "data")
		reply.Set(fmt.Sprintf("the alias with id %s were not found", aliasObject.GUID), "message")
	}

	if err := als.AliasService.Delete(&aliasObject); err != nil {
		reply := gabs.New()
		reply.Set(aliasObject.GUID, "data")
		reply.Set(fmt.Sprintf("the alias with id %s were not found", aliasObject.GUID), "message")
	}

	reply := gabs.New()
	reply.Set(data.GUID, "data")
	reply.Set("successfully deleted alias", "message")

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply.String())
}

// swagger:operation PUT /alias/{guid} alias aliasUpdateAlias
//
// Update alias
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: guid
//   in: path
//   example: 11111111-1111-1111-1111-111111111111
//   description: uuid of the alias to update
//   required: true
//   type: string
// - name: aliasStruct
//   in: body
//   description: alias parameters
//   schema:
//     "$ref": "#/definitions/AliasStruct"
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
//   '201': body:AliasStruct
func (als *AliasController) UpdateAlias(c echo.Context) error {
	aliasObject := model.TableAlias{}
	if err := c.Bind(&aliasObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	// validate input request body
	if err := c.Validate(aliasObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	aliasObject.GUID = c.Param("guid")
	data, err := als.AliasService.Get(&aliasObject)
	if err != nil {
		reply := gabs.New()
		reply.Set(aliasObject.GUID, "data")
		reply.Set(fmt.Sprintf("the alias with id %s were not found", aliasObject.GUID), "message")
	}

	aliasObject.CreateDate = time.Now()
	aliasObject.Id = data.Id
	if err := als.AliasService.Update(&aliasObject); err != nil {
		reply := gabs.New()
		reply.Set(aliasObject.GUID, "data")
		reply.Set(fmt.Sprintf("the alias with id %s were not found", aliasObject.GUID), "message")
	}

	reply := gabs.New()
	reply.Set(data.GUID, "data")
	reply.Set("successfully updated alias", "message")

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply.String())
}

// swagger:route GET /alias alias aliasGetAllAlias
//
// Get all aliases
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
//   '200': body:AliasStruct
func (alc *AliasController) GetAllAlias(c echo.Context) error {

	alias, _ := alc.AliasService.GetAll()

	sort.Slice(alias[:], func(i, j int) bool {
		return alias[i].GUID < alias[j].GUID
	})

	reply := gabs.New()
	reply.Set(alias, "data")

	//reply, _ := json.Marshal(alias)

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply.String())
}
