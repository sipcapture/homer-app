package auth

import (
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/sipcapture/homer-app/model"
	"github.com/sirupsen/logrus"
)

// jwt token claims which contains info regarding user
type JwtUserClaim struct {
	UserName     string `json:"username"`
	UserAdmin    bool   `json:"useradmin"`
	UserGroup    string `json:"usergroup"`
	ExternalAuth bool   `json:"externalauth"`
	jwt.StandardClaims
}

func Token(user model.TableUser) (string, error) {

	tNow := time.Now()
	tUTC := tNow

	newTUTC := tUTC.Add(time.Duration(TokenExpiryTime) * time.Minute)

	// Set custom claims
	claims := &JwtUserClaim{
		user.UserName,
		user.IsAdmin,
		user.UserGroup,
		user.ExternalAuth,
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
