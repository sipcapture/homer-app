package controllerv1

import (
	"fmt"
	"net"

	"github.com/sirupsen/logrus"

	"github.com/labstack/echo/v4"
	"golang.org/x/net/websocket"
)

type WebSocketController struct {
	Controller
	Addr *string
}

// swagger:operation GET /ws WebSocket
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
func (wb *WebSocketController) RelayHepData(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		conn, err := net.Dial("udp", *wb.Addr)
		if err != nil {
			fmt.Printf("Some error %v", err)
			return
		}

		defer func() {
			ws.Close()
			conn.Close()
		}()
		for {
			// Read
			var msg []byte
			err = websocket.Message.Receive(ws, &msg)
			if err != nil {
				logrus.Error(fmt.Sprintf("got error while reading data on websocket", err))
				break
			}
			_, err = conn.Write(msg)
			if err != nil {
				logrus.Error(fmt.Sprintf("got error while writing data on hep socket", err))
				break
			}
		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
