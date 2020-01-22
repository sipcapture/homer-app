package auth

import (
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/sipcapture/homer-app/model"
	"github.com/sirupsen/logrus"
)

// jwt token claims which contains info regarding user
type JwtUserClaim struct {
	UserName  string `json:"username"`
	UserAdmin bool   `json:"useradmin"`
	jwt.StandardClaims
}

func Token(user model.TableUser) (string, error) {

	tNow := time.Now()
	tUTC := tNow
	newTUTC := tUTC.Add(time.Minute * TokenExpiryTime)
	adminUser := false

	if user.UserGroup != "" && strings.Contains(strings.ToLower(user.UserGroup), "admin") {
		adminUser = true
	}

	// Set custom claims
	claims := &JwtUserClaim{
		user.UserName,
		adminUser,
		jwt.StandardClaims{
			ExpiresAt: newTUTC.Unix(),
		},
	}

	logrus.Println("Current time : ")
	logrus.Print(tNow)

	logrus.Println("Local time : ")
	logrus.Print(tUTC)

	logrus.Println("Expire Local time : ")
	logrus.Print(newTUTC)

	logrus.Println("Claims")

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token and send it as response.
	t, err := token.SignedString([]byte(JwtSecret))
	if err != nil {
		return "", err
	}

	return t, nil
}
