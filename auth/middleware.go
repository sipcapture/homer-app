package auth

import (
	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/logger"
)

func MiddlewareRes(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		user := c.Get("user").(*jwt.Token)
		claims := user.Claims.(*JwtUserClaim)
		logger.Debug("Claims")
		logger.Debug(claims)

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

	if c.Get("user") != nil {
		user := c.Get("user").(*jwt.Token)
		if user != nil {
			claims := user.Claims.(*JwtUserClaim)
			return claims.UserGroup
		} else {
			return "guest"
		}
	} else {
		return "guest"
	}
}
