package auth

import (
	"fmt"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/logger"
)

func MiddlewareRes(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		if c.Get("user") != nil {
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

		if c.Get("authtoken") != nil {

			tokenKey := c.Get("authtoken").(model.KeyContext)

			logger.Debug("Authkey: ", tokenKey.AuthKey)
			logger.Debug(tokenKey)

			if err := next(tokenKey); err != nil {
				c.Error(err)
			}
			return nil
		}

		return nil
	}
}

func IsAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if c.Get("user") != nil {
			user := c.Get("user").(*jwt.Token)
			claims := user.Claims.(*JwtUserClaim)
			isAdmin := claims.UserAdmin
			if !isAdmin {
				return echo.NewHTTPError(403, "This API requires admin access.")
			}
			return next(c)
		} else if c.Get("authtoken") != nil {

			tokenKey := c.Get("authtoken").(model.KeyContext)
			isAdmin := tokenKey.UserAdmin

			if !isAdmin {
				return echo.NewHTTPError(403, "This API requires admin access. The AuthToken in use!")
			}
			return next(c)
		} else {
			//return httpresponse.CreateSuccessResponseWithJson(&c, http.StatusOK, []byte(reply))
			return echo.NewHTTPError(403, "This API requires admin access!")
		}
	}
}

/* check if it's admin */
func IsRequestAdmin(c echo.Context) (string, bool) {
	if c.Get("user") != nil {
		user := c.Get("user").(*jwt.Token)
		claims := user.Claims.(*JwtUserClaim)
		isAdmin := claims.UserAdmin
		return claims.UserName, isAdmin
	} else if c.Get("authtoken") != nil {
		tokenKey := c.Get("authtoken").(model.KeyContext)
		isAdmin := tokenKey.UserAdmin
		return tokenKey.UserName, isAdmin
	} else {
		return "default", false
	}
}

/* get user group */
func GetUserGroup(c echo.Context) string {

	if c.Get("user") != nil {
		user := c.Get("user").(*jwt.Token)
		claims := user.Claims.(*JwtUserClaim)
		return claims.UserGroup
	} else if c.Get("authtoken") != nil {
		tokenKey := c.Get("authtoken").(model.KeyContext)
		return tokenKey.UserGroup
	} else {
		return "guest"
	}
}

/* get user group */
func GetUserProfile(c echo.Context) (*JwtUserClaim, error) {

	if c.Get("user") != nil {
		user := c.Get("user").(*jwt.Token)
		if user != nil {
			claims := user.Claims.(*JwtUserClaim)
			return claims, nil
		}
	}

	return nil, fmt.Errorf("no user in token")
}
