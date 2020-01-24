package auth

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/model"
	"github.com/sirupsen/logrus"
)

func MiddlewareRes(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		user := c.Get("user").(*jwt.Token)
		claims := user.Claims.(*JwtUserClaim)
		logrus.Println("Claims")
		logrus.Print(claims)

		appContext := model.AppContext{Context: c, UserName: claims.UserName, Admin: claims.UserAdmin}
		if err := next(appContext); err != nil {
			c.Error(err)
		}
		return nil
	}
}

func IsAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := c.Get("user").(*jwt.Token)
		claims := user.Claims.(*JwtUserClaim)
		isAdmin := claims.UserAdmin
		if isAdmin == false {
			return echo.ErrUnauthorized
		}
		return next(c)
	}
}

/* check if it's admin */
func IsRequestAdmin(c echo.Context) (string, bool) {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(*JwtUserClaim)
	isAdmin := claims.UserAdmin
	return claims.UserName, isAdmin
}
