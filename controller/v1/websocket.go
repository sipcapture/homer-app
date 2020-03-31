package controllerv1

import (
	"fmt"
	"github.com/sirupsen/logrus"
	"net"

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
				c.Logger().Error(err)
			}
			fmt.Printf("%s\n", msg)

			fmt.Fprintf(conn, "Hi UDP Server, How are you doing?")
			_, err = conn.Write(msg)
			if err == nil {
				logrus.Error("Suscess in writing")
			} else {
				logrus.Printf("Some error %v\n", err)
			}
		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
