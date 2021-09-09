package model

import (
	"encoding/json"

	"github.com/labstack/echo/v4"
)

type AppContext struct {
	echo.Context
	UserName     string `json:"username"`
	Admin        bool   `json:"admin"`
	UserGroup    string `json:"usergroup"`
	ExternalAuth bool   `json:"externalauth"`
}

// swagger:model SuccessResponse
type SuccessfulResponse struct {
	// count elements in data
	//
	// required: true
	Count int `json:"count"`
	// data in JSON format
	// type: object
	// required: true
	Data json.RawMessage `json:"data"`
	// the message for user
	//
	// required: true
	Message string `json:"message"`
}
