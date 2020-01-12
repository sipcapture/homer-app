package controllerv1

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
	"gitlab.com/qxip/webapp-go/data/service"
	"gitlab.com/qxip/webapp-go/model"
	httpresponse "gitlab.com/qxip/webapp-go/network/response"
	"gitlab.com/qxip/webapp-go/system/webmessages"
)

type StatisticController struct {
	Controller
	StatisticService *service.StatisticService
}

// swagger:route GET /api/statistic/data search
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
func (sc *StatisticController) StatisticData(c echo.Context) error {

	searchObject := model.StatisticObject{}

	if err := c.Bind(&searchObject); err != nil {
		logrus.Error(err.Error())
		return httpresponse.CreateBadResponse(&c, http.StatusBadRequest, webmessages.UserRequestFormatIncorrect)
	}

	responseData, err := sc.StatisticService.StatisticData(&searchObject)
	if err != nil {
		fmt.Println(responseData)
	}
	return httpresponse.CreateSuccessResponse(&c, http.StatusCreated, responseData)
}
