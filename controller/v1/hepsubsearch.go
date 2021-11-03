package controllerv1

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/utils/logger"
)

type HepsubsearchController struct {
	Controller
	HepsubsearchService *service.HepsubsearchService
}

// swagger:route POST /hepsub/search hep hepSubSearchDoHepsubsearch
//
// Add hepsubsearch item
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: SearchObject
//   in: body
//   type: object
//   description: SearchObject parameters
//   schema:
//     type: SearchObject
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
//   201: body:HepsubCreateSuccessResponse
//   400: body:FailureResponse
func (hss *HepsubsearchController) DoHepsubsearch(c echo.Context) error {
	// Stub an user to be populated from the body
	searchObject := model.SearchObject{}
	err := c.Bind(&searchObject)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	// validate input request body
	if err := c.Validate(searchObject); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}

	reply, err := hss.HepsubsearchService.DoHepSubSearch(searchObject)
	if err != nil {
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, err.Error())
	}
	return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusCreated, []byte(reply))
}
