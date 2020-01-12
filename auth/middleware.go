package auth

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
	"github.com/sipcapture/homer-app/model"
)

func MiddlewareRes(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		user := c.Get("user").(*jwt.Token)
		claims := user.Claims.(*JwtUserClaim)
		logrus.Println("Claims")
		logrus.Print(claims)

		appContext := model.AppContext{Context: c, UserName: claims.UserName}
		if err := next(appContext); err != nil {
			c.Error(err)
		}
		return nil
	}
}
