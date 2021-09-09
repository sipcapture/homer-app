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

/* check if it's admin */
func GetUserGroup(c echo.Context) string {
	user := c.Get("user").(*jwt.Token)

	claims := user.Claims.(*JwtUserClaim)
	return claims.UserGroup
}
