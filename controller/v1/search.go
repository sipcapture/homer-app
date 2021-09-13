package controllerv1

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"strconv"
	"time"

	"github.com/Jeffail/gabs/v2"
	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/auth"
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

// swagger:operation POST /search/call/data search searchSearchData
//
// Returns data based upon filtered json
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: SearchObject
//   in: body
//   type: object
//   description: SearchObject parameters
//   schema:
//     "$ref": "#/definitions/SearchCallData"
//   required: true
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

	aliasRowData, _ := sc.AliasService.GetAllActive()
	aliasData := make(map[string]string)
	for _, row := range aliasRowData {
		cidr := row.IP + "/" + strconv.Itoa(*row.Mask)
		Port := strconv.Itoa(*row.Port)
		ip, ipnet, err := net.ParseCIDR(cidr)
		if err != nil {
			logrus.Println("ParseCIDR alias CIDR: ["+cidr+"] error: ", err.Error())
			logrus.Error("ParseCIDR alias CIDR: ["+cidr+"] error: ", err.Error())
		} else {
			for ip := ip.Mask(ipnet.Mask); ipnet.Contains(ip); inc(ip) {
				aliasData[ip.String()+":"+Port] = row.Alias
			}
		}
	}

	userGroup := auth.GetUserGroup(c)

	responseData, err := sc.SearchService.SearchData(&searchObject, aliasData, userGroup)
	if err != nil {
		logrus.Error("Error during data select: ", err.Error())
		logrus.Error("Error data select: ", responseData)
		return httpresponse.CreateBadResponse(&c, http.StatusServiceUnavailable, webmessages.BadDatabaseRetrieve)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}

func inc(ip net.IP) {
	for j := len(ip) - 1; j >= 0; j-- {
		ip[j]++
		if ip[j] > 0 {
			break
		}
	}
}

// swagger:operation POST /search/call/message search searchGetMessageById
//
// Returns message data based upon filtered json
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: SearchObject
//   in: body
//   type: object
//   description: SearchObject parameters
//   schema:
//     "$ref": "#/definitions/SearchCallData"
//   required: true
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

// swagger:operation POST /search/call/decode/message search searchGetDecodeMessageById
//
// Returns data based upon filtered json
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: SearchObject
//   in: body
//   type: object
//   description: SearchObject parameters
//   schema:
//     "$ref": "#/definitions/SearchCallData"
//   required: true
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

// swagger:operation POST /call/transaction search searchGetTransaction
//
// Returns transaction data based upon filtered json
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: SearchObject
//   in: body
//   type: object
//   description: SearchObject parameters
//   schema:
//     "$ref": "#/definitions/SearchCallData"
//   required: true
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (sc *SearchController) GetTransaction(c echo.Context) error {

	transactionObject := model.SearchObject{}
	if err := c.Bind(&transactionObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	transactionData, _ := json.Marshal(transactionObject)
	correlation, _ := sc.SettingService.GetCorrelationMap(&transactionObject)
	aliasRowData, _ := sc.AliasService.GetAllActive()

	aliasData := make(map[string]string)
	for _, row := range aliasRowData {
		cidr := row.IP + "/" + strconv.Itoa(*row.Mask)
		Port := strconv.Itoa(*row.Port)
		ip, ipnet, err := net.ParseCIDR(cidr)

		if err != nil {
			logrus.Println("ParseCIDR alias CIDR: ["+cidr+"] error: ", err.Error())
			logrus.Error("ParseCIDR alias CIDR: ["+cidr+"] error: ", err.Error())
		} else {
			for ip := ip.Mask(ipnet.Mask); ipnet.Contains(ip); inc(ip) {
				aliasData[ip.String()+":"+Port] = row.Alias
			}
		}
	}

	searchTable := "hep_proto_1_default'"

	userGroup := auth.GetUserGroup(c)

	reply, _ := sc.SearchService.GetTransaction(searchTable, transactionData,
		correlation, false, aliasData, 0, transactionObject.Param.Location.Node,
		sc.SettingService, userGroup, transactionObject.Param.WhiteList)

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply)

}

// swagger:operation POST /call/report/qos search searchGetTransactionQos
//
// Returns qos data based upon filtered json
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: SearchObject
//   in: body
//   type: object
//   description: SearchObject parameters
//   schema:
//     "$ref": "#/definitions/SearchCallData"
//   required: true
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (sc *SearchController) GetTransactionQos(c echo.Context) error {

	searchObject := model.SearchObject{}
	if err := c.Bind(&searchObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	transactionData, _ := json.Marshal(searchObject)

	searchTable := [...]string{"hep_proto_5_default", "hep_proto_35_default"}

	row, _ := sc.SearchService.GetTransactionQos(searchTable, transactionData, searchObject.Param.Location.Node)

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, row)

}

// swagger:operation POST /call/report/log search searchGetTransactionLog
//
// Returns log data based upon filtered json
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: SearchObject
//   in: body
//   type: object
//   description: SearchObject parameters
//   schema:
//     "$ref": "#/definitions/SearchCallData"
//   required: true
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (sc *SearchController) GetTransactionLog(c echo.Context) error {

	searchObject := model.SearchObject{}
	if err := c.Bind(&searchObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	transactionData, _ := json.Marshal(searchObject)
	searchTable := "hep_proto_100_default"
	row, _ := sc.SearchService.GetTransactionLog(searchTable, transactionData, searchObject.Param.Location.Node)

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, row)
}

func (sc *SearchController) GetTransactionHepSub(c echo.Context) error {

	searchObject := model.SearchObject{}
	if err := c.Bind(&searchObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}
	transactionData, _ := json.Marshal(searchObject)

	searchTable := "hep_proto_100_default"
	row, _ := sc.SearchService.GetTransactionLog(searchTable, transactionData, searchObject.Param.Location.Node)

	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, row)
}

// swagger:operation POST /export/call/messages/pcap search searchGetMessagesAsPCap
//
// Returns pcap data based upon filtered json
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: SearchObject
//   in: body
//   type: object
//   description: SearchObject parameters
//   schema:
//     "$ref": "#/definitions/SearchCallData"
//   required: true
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (sc *SearchController) GetMessagesAsPCap(c echo.Context) error {

	searchObject := model.SearchObject{}
	if err := c.Bind(&searchObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	transactionData, _ := json.Marshal(searchObject)
	correlation, _ := sc.SettingService.GetCorrelationMap(&searchObject)
	aliasRowData, _ := sc.AliasService.GetAllActive()

	aliasData := make(map[string]string)
	for _, row := range aliasRowData {
		Port := strconv.Itoa(*row.Port)
		aliasData[row.IP+":"+Port] = row.Alias
	}

	searchTable := "hep_proto_1_default'"
	userGroup := auth.GetUserGroup(c)

	reply, _ := sc.SearchService.GetTransaction(searchTable, transactionData, correlation, false, aliasData, 1,
		searchObject.Param.Location.Node, sc.SettingService, userGroup, searchObject.Param.WhiteList)

	c.Response().Header().Set(echo.HeaderContentDisposition, fmt.Sprintf("attachment; filename=export-%s.pcap", time.Now().Format(time.RFC3339)))
	if err := c.Blob(http.StatusOK, "application/octet-stream", []byte(reply)); err != nil {
		logrus.Error(err.Error())
	}

	c.Response().Flush()
	return nil

}

// swagger:operation POST /export/call/messages/text search searchGetMessagesAsText
//
// Returns text data based upon filtered json
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: SearchObject
//   in: body
//   type: object
//   description: SearchObject parameters
//   schema:
//     "$ref": "#/definitions/SearchCallData"
//   required: true
// SecurityDefinitions:
// bearer:
//      type: apiKey
//      name: Authorization
//      in: header
// responses:
//   '200': body:ListUsers
//   '400': body:UserLoginFailureResponse
func (sc *SearchController) GetMessagesAsText(c echo.Context) error {

	searchObject := model.SearchObject{}
	if err := c.Bind(&searchObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	transactionData, _ := json.Marshal(searchObject)
	correlation, _ := sc.SettingService.GetCorrelationMap(&searchObject)
	aliasData := make(map[string]string)

	searchTable := "hep_proto_1_default'"

	userGroup := auth.GetUserGroup(c)

	reply, _ := sc.SearchService.GetTransaction(searchTable, transactionData,
		correlation, false, aliasData, 2, searchObject.Param.Location.Node,
		sc.SettingService, userGroup, searchObject.Param.WhiteList)

	c.Response().Header().Set(echo.HeaderContentDisposition, fmt.Sprintf("attachment; filename=export-%s.txt", time.Now().Format(time.RFC3339)))
	if err := c.String(http.StatusOK, reply); err != nil {
		logrus.Error(err.Error())
	}

	c.Response().Flush()

	return nil

	//return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply)

}

// swagger:route POST /import/data/pcap Import GetMessagesAsPCap
//
// Returns pcap data based upon filtered json
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
//     "$ref": "#/definitions/ExportCallData"
//   required: true
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
// Responses:
//   201: body:ListUsers
//   400: body:FailureResponse
func (sc *SearchController) GetDataAsPCap(c echo.Context) error {

	file, err := c.FormFile("fileKey")
	if err != nil {
		logrus.Error("GetDataAsPCap fileKey was not found: ", err.Error())
		return err
	}

	src, err := file.Open()
	if err != nil {
		logrus.Error("GetDataAsPCap couldn't open it: ", err.Error())
		return err
	}
	defer src.Close()

	buf := bytes.NewBuffer(nil)

	// Copy
	if _, err = io.Copy(buf, src); err != nil {
		logrus.Error("GetDataAsPCap couldn't copy it: ", err.Error())
		return err
	}

	goodCounter, badCounter, err := sc.SearchService.ImportPcapData(buf, false)
	if err != nil {
		logrus.Error("Bad decoding: ", err)
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.BadPCAPData)
	} else {
		reply := gabs.New()
		report := gabs.New()
		report.Set(goodCounter, "inserted")
		report.Set(badCounter, "rejected")
		reply.Set(report.Data(), "data")
		reply.Set("All good", "message")

		return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply.String())
	}
}

// swagger:route POST /import/data/pcap/now Import GetMessagesAsPCapNow
//
// Returns pcap data based upon filtered json
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
//     "$ref": "#/definitions/ExportCallData"
//   required: true
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
// Responses:
//   201: body:ListUsers
//   400: body:FailureResponse
func (sc *SearchController) GetDataAsPCapNow(c echo.Context) error {

	file, err := c.FormFile("fileKey")
	if err != nil {
		logrus.Error("GetDataAsPCap fileKey was not found: ", err.Error())
		return err
	}

	src, err := file.Open()
	if err != nil {
		logrus.Error("GetDataAsPCap couldn't open it: ", err.Error())
		return err
	}
	defer src.Close()

	buf := bytes.NewBuffer(nil)

	// Copy
	if _, err = io.Copy(buf, src); err != nil {
		logrus.Error("GetDataAsPCap couldn't copy it: ", err.Error())
		return err
	}

	goodCounter, badCounter, err := sc.SearchService.ImportPcapData(buf, true)
	if err != nil {
		logrus.Error("Bad decoding: ", err)
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.BadPCAPData)
	} else {
		reply := gabs.New()
		report := gabs.New()
		report.Set(goodCounter, "inserted")
		report.Set(badCounter, "rejected")
		reply.Set(report.Data(), "data")
		reply.Set("All good", "message")

		return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, reply.String())
	}
}
