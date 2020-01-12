package model

import (
	"github.com/labstack/echo"
)

type AppContext struct {
	echo.Context
	UserName string `json:"username"`
}
