package controllerv1

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/data/service"
	"github.com/sipcapture/homer-app/model"
	httpresponse "github.com/sipcapture/homer-app/network/response"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sirupsen/logrus"
)

type SearchController struct {
	Controller
	SearchService  *service.SearchService
	SettingService *service.UserSettingsService
	AliasService   *service.AliasService
}

// swagger:route GET /api/search/call/data search
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
func (sc *SearchController) SearchData(c echo.Context) error {

	searchObject := model.SearchObject{}

	if err := c.Bind(&searchObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	aliasRowData, _ := sc.AliasService.GetAll()
	aliasData := make(map[string]string)
	for _, row := range aliasRowData {
		Port := strconv.Itoa(row.Port)
		aliasData[row.IP+":"+Port] = row.Alias
	}

	responseData, err := sc.SearchService.SearchData(&searchObject, aliasData)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route POST /api/search/call/message search
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
func (sc *SearchController) GetMessageById(c echo.Context) error {

	searchObject := model.SearchObject{}

	if err := c.Bind(&searchObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := sc.SearchService.GetMessageByID(&searchObject)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route POST /api/search/call/message search
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
func (sc *SearchController) GetDBNodeList(c echo.Context) error {

	searchObject := model.SearchObject{}

	if err := c.Bind(&searchObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := sc.SearchService.GetMessageByID(&searchObject)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route POST /api/search/call/decode/message search
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
func (sc *SearchController) GetDecodeMessageById(c echo.Context) error {

	searchObject := model.SearchObject{}

	if err := c.Bind(&searchObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := sc.SearchService.GetDecodedMessageByID(&searchObject)
	if err != nil {
		logrus.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

// swagger:route GET /api/call/transaction search
//
// Returns data related to transaction
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
func (sc *SearchController) GetTransaction(c echo.Context) error {

	transactionObject := model.TransactionObject{}
	if err := c.Bind(&transactionObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	transactionData, _ := json.Marshal(transactionObject)
	correlation, _ := sc.SettingService.GetCorrelationMap(&transactionObject)
	aliasRowData, _ := sc.AliasService.GetAll()

	aliasData := make(map[string]string)
	for _, row := range aliasRowData {
		Port := strconv.Itoa(row.Port)
		aliasData[row.IP+":"+Port] = row.Alias
	}

	searchTable := "hep_proto_1_default'"

	reply, _ := sc.SearchService.GetTransaction(searchTable, transactionData,
		correlation, false, aliasData, 0)

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply)

}

// swagger:route GET /api/call/report/qos search
//
// Returns qos stats
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
func (sc *SearchController) GetTransactionQos(c echo.Context) error {

	transactionObject := model.TransactionObject{}
	if err := c.Bind(&transactionObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	transactionData, _ := json.Marshal(transactionObject)

	searchTable := [...]string{"hep_proto_5_default", "hep_proto_35_default"}

	row, _ := sc.SearchService.GetTransactionQos(searchTable, transactionData)

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, row)

}

// swagger:route GET /api/call/report/log search
//
// Returns logs related to transaction
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
func (sc *SearchController) GetTransactionLog(c echo.Context) error {

	transactionObject := model.TransactionObject{}
	if err := c.Bind(&transactionObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	transactionData, _ := json.Marshal(transactionObject)
	searchTable := "hep_proto_100_default"
	row, _ := sc.SearchService.GetTransactionLog(searchTable, transactionData)

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, row)
}

func (sc *SearchController) GetTransactionHepSub(c echo.Context) error {

	transactionObject := model.TransactionObject{}
	if err := c.Bind(&transactionObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	transactionData, _ := json.Marshal(transactionObject)

	searchTable := "hep_proto_100_default"
	row, _ := sc.SearchService.GetTransactionLog(searchTable, transactionData)

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, row)
}

// swagger:route GET /api/v3/export/call/messages/pcap search
//
// Returns messages related to transaction
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
func (sc *SearchController) GetMessagesAsPCap(c echo.Context) error {

	transactionObject := model.TransactionObject{}
	if err := c.Bind(&transactionObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	transactionData, _ := json.Marshal(transactionObject)
	correlation, _ := sc.SettingService.GetCorrelationMap(&transactionObject)
	aliasRowData, _ := sc.AliasService.GetAll()

	aliasData := make(map[string]string)
	for _, row := range aliasRowData {
		Port := strconv.Itoa(row.Port)
		aliasData[row.IP+":"+Port] = row.Alias
	}

	searchTable := "hep_proto_1_default'"

	reply, _ := sc.SearchService.GetTransaction(searchTable, transactionData,
		correlation, false, aliasData, 1)

	c.Response().Header().Set(echo.HeaderContentDisposition, fmt.Sprintf("attachment; filename=export-%s.pcap", time.Now().Format(time.RFC3339)))
	if err := c.Blob(http.StatusOK, "application/octet-stream", []byte(reply)); err != nil {
		logrus.Error(err.Error())
	}

	c.Response().Flush()
	return nil

}

// swagger:route GET /api/v3/export/call/messages/text search
//
// Returns messages related to transaction
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
func (sc *SearchController) GetMessagesAsText(c echo.Context) error {

	transactionObject := model.TransactionObject{}
	if err := c.Bind(&transactionObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	transactionData, _ := json.Marshal(transactionObject)
	correlation, _ := sc.SettingService.GetCorrelationMap(&transactionObject)
	aliasData := make(map[string]string)

	searchTable := "hep_proto_1_default'"

	reply, _ := sc.SearchService.GetTransaction(searchTable, transactionData,
		correlation, false, aliasData, 2)

	c.Response().Header().Set(echo.HeaderContentDisposition, fmt.Sprintf("attachment; filename=export-%s.txt", time.Now().Format(time.RFC3339)))
	if err := c.String(http.StatusOK, reply); err != nil {
		logrus.Error(err.Error())
	}

	c.Response().Flush()

	return nil

	//return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply)

}
