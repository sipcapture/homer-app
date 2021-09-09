package auth

import (
	"github.com/golang-jwt/jwt"
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

		appContext := model.AppContext{
			Context:      c,
			UserName:     claims.UserName,
			Admin:        claims.UserAdmin,
			UserGroup:    claims.UserGroup,
			ExternalAuth: claims.ExternalAuth,
		}
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
		if !isAdmin {
			return echo.NewHTTPError(403, "This API requires admin access. The AuthToken in use!")
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

/* get user group */
func GetUserGroup(c echo.Context) string {

	logrus.Println("Preparing to get user...")

	if c.Get("user") != nil {
		logrus.Println("Preparing to get user [1] ")

		user := c.Get("user").(*jwt.Token)
		if user != nil {
			logrus.Println("Preparing to get user [1] ")
			claims := user.Claims.(*JwtUserClaim)
			logrus.Println("Preparing to get user [3] ")
			logrus.Println("Preparing to get user [4] ", claims.UserGroup)
			return claims.UserGroup
		} else {
			logrus.Println("Couldn't get object user to check group - send to guest!")
			logrus.Error("Couldn't get object user to check group - send to guest!")
			return "guest"
		}
	} else {
		logrus.Println("Couldn't retrieve user group - send to guest!")
		logrus.Error("Couldn't retrieve user group - send to guest!")
		return "guest"
	}
}
