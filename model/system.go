package model

import (
	"github.com/labstack/echo/v4"
)

type AppContext struct {
	echo.Context
	UserName     string `json:"username"`
	Admin        bool   `json:"admin"`
	UserGroup    string `json:"usergroup"`
	ExternalAuth bool   `json:"externalauth"`
}
