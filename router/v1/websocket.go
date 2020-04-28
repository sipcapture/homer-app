package apirouterv1

import (
	"github.com/labstack/echo/v4"
	controllerv1 "github.com/sipcapture/homer-app/controller/v1"
)

// routesearch Apis
func RouteWebSocketApis(acc *echo.Group, addr string) {
	// initialize service of user
	// create new user

	wc := controllerv1.WebSocketController{Addr: &addr}
	acc.GET("/ws", wc.RelayHepData)

}
