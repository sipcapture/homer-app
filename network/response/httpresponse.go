package httpresponse

import (
	"fmt"

	"github.com/labstack/echo/v4"
)

func CreateBadResponse(c *echo.Context, requestCode int, message string) error {
	localC := *c
	response := fmt.Sprintf("{\"data\":{},\"message\":%q}", message)
	return localC.JSONBlob(requestCode, []byte(response))
}

func CreateSuccessResponse(c *echo.Context, requestCode int, message string) error {
	localC := *c
	return localC.JSONBlob(requestCode, []byte(message))
}

func CreateBadResponseWithJson(c *echo.Context, requestCode int, message []byte) error {
	localC := *c
	return localC.JSONBlob(requestCode, message)
}

func CreateSuccessResponseWithJson(c *echo.Context, requestCode int, message []byte) error {
	localC := *c
	return localC.JSONBlob(requestCode, []byte(message))
}
