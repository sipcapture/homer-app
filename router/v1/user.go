package apirouterv1

import (
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo"
	controllerv1 "gitlab.com/qxip/webapp-go/controller/v1"
	"gitlab.com/qxip/webapp-go/data/service"
	"gitlab.com/qxip/webapp-go/utils/ldap"
)

func RouteUserDetailsApis(acc *echo.Group, session *gorm.DB) {
	// initialize service of user
	userService := service.UserService{Service: service.Service{Session: session}, LdapClient: nil}
	// initialize user controller
	urc := controllerv1.UserController{
		UserService: &userService,
	}
	// get all user
	acc.GET("/users", urc.GetUser)
	// create new user
	acc.POST("/users", urc.CreateUser)
	// update user
	acc.PUT("/users/:userGuid", urc.UpdateUser)
	// delete user
	acc.DELETE("/users/:userGuid", urc.DeleteUser)
}

func RouteUserApis(acc *echo.Group, session *gorm.DB, ldapClient *ldap.LDAPClient) {
	// initialize service of user
	userService := service.UserService{Service: service.Service{Session: session}, LdapClient: ldapClient}
	// initialize user controller
	urc := controllerv1.UserController{
		UserService: &userService,
	}
	// user login
	acc.POST("/auth", urc.LoginUser)
}
