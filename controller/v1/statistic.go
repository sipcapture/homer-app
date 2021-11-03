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

type StatisticController struct {
	Controller
	StatisticService *service.StatisticService
}

// swagger:route POST /statistic/data statistic statisticStatisticData
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
// + name: StatisticSearchObject
//   in: body
//   type: StatisticSearchObject
//   description: StatisticSearchObject
//   required: true
// responses:
//   200: body:StatisticDb
//   400: body:FailureResponse
func (sc *StatisticController) StatisticData(c echo.Context) error {

	if !sc.StatisticService.Active {
		logger.Error("Influxdb service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Influxdb service is not enabled")
	}

	searchObject := model.StatisticObject{}
	if err := c.Bind(&searchObject); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := sc.StatisticService.StatisticData(&searchObject)
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /statistic/_db statistic statisticGetStatisticDBList
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
// responses:
//   200: body:StatisticDb
//   400: body:FailureResponse
func (sc *StatisticController) GetStatisticDBList(c echo.Context) error {

	if !sc.StatisticService.Active {
		logger.Error("Influxdb service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Influxdb service is not enabled")
	}

	responseData, err := sc.StatisticService.StatisticDataBaseList()
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route POST /statistic/_retentions statistic statisticGetStatisticRetentionsList
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
// + name: StatisticSearchObject
//   in: body
//   type: StatisticSearchObject
//   description: StatisticSearchObject
//   required: true
// responses:
//   200: body:StatisticRetentions
//   400: body:UserLoginFailureResponse
func (sc *StatisticController) GetStatisticRetentionsList(c echo.Context) error {

	if !sc.StatisticService.Active {
		logger.Error("Influxdb service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Influxdb service is not enabled")
	}

	searchObject := model.StatisticSearchObject{}

	if err := c.Bind(&searchObject); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := sc.StatisticService.StatisticRetentionsList(&searchObject)
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /statistic/_measurements/{dbid} statistic statisticGetStatisticMeasurementsList
//
// Returns data based upon filtered json
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// + name: dbid
//   in: path
//   type: string
//   description: database id
//   required: true
// + name: StatisticSearchObject
//   in: body
//   type: StatisticSearchObject
//   description: StatisticSearchObject
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
//   200: body:StatisticObject
//   '400': body:UserLoginFailureResponse
func (sc *StatisticController) GetStatisticMeasurementsList(c echo.Context) error {

	if !sc.StatisticService.Active {
		logger.Error("Influxdb service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Influxdb service is not enabled")
	}

	dbID := c.Param("dbid")

	responseData, err := sc.StatisticService.StatisticMeasurementsList(dbID)
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route POST /statistic/_metrics statistic statisticGetStatisticMetricsList
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
// + name: StatisticSearchObject
//   in: body
//   type: StatisticSearchObject
//   description: StatisticSearchObject
//   required: true
// responses:
//   200: body:StatisticDb
//   400: body:FailureResponse
func (sc *StatisticController) GetStatisticMetricsList(c echo.Context) error {

	if !sc.StatisticService.Active {
		logger.Error("Influxdb service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Influxdb service is not enabled")
	}

	searchObject := model.StatisticObject{}

	if err := c.Bind(&searchObject); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := sc.StatisticService.StatisticMetricsList(&searchObject)
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route POST /statistic/_tags statistic statisticGetStatisticTagsList
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
// + name: StatisticSearchObject
//   in: body
//   type: StatisticSearchObject
//   description: StatisticSearchObject
//   required: true
// responses:
//   200: body:StatisticDb
//   400: body:FailureResponse
func (sc *StatisticController) GetStatisticTagsList(c echo.Context) error {

	if !sc.StatisticService.Active {
		logger.Error("Influxdb service is not enabled")
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, "Influxdb service is not enabled")
	}

	searchObject := model.StatisticObject{}

	if err := c.Bind(&searchObject); err != nil {
		logger.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := sc.StatisticService.StatisticTagsList(&searchObject)
	if err != nil {
		logger.Debug(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}
