package migration

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"

	"github.com/jinzhu/gorm"
	"github.com/sipcapture/homer-app/migration/jsonschema"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/logger"
	"golang.org/x/crypto/bcrypt"
)

func generateBootstrapPassword() (string, error) {
	buf := make([]byte, 24)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("generate bootstrap password: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

// replacementPassword returns the operator password, or a new random password
// when the operator did not set one or set the historical default.
func replacementPassword(supplied string) (plain string, generated bool, err error) {
	if supplied != "" && supplied != jsonschema.DisallowedDefaultPassword {
		return supplied, false, nil
	}
	plain, err = generateBootstrapPassword()
	if err != nil {
		return "", false, err
	}
	return plain, true, nil
}

func seedUserPasswords(supplied string) (adminPlain, supportPlain string, generated bool, err error) {
	adminPlain, generated, err = replacementPassword(supplied)
	if err != nil || !generated {
		return adminPlain, adminPlain, generated, err
	}
	supportPlain, _, err = replacementPassword("")
	if err != nil {
		return "", "", false, err
	}
	return adminPlain, supportPlain, true, nil
}

func hashPassword(plain string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

func isWellKnownDefaultHash(hash string) bool {
	if hash == "" {
		return false
	}
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(jsonschema.DisallowedDefaultPassword)) == nil
}

// bootstrapPasswordDirectory is where a generated password is written.
// The file is mode 0600. Logs only receive the path.
var bootstrapPasswordDirectory = "/usr/local/homer"

func bootstrapPasswordPath(username string) string {
	return filepath.Join(bootstrapPasswordDirectory, "bootstrap-password-"+username)
}

func removeBootstrapPassword(username string) {
	_ = os.Remove(bootstrapPasswordPath(username))
}

// storeBootstrapPassword writes the generated password for the operator to read
// and prints only the file path. The password itself is not logged.
func storeBootstrapPassword(username, plain string) error {
	if err := os.MkdirAll(bootstrapPasswordDirectory, 0700); err != nil {
		return fmt.Errorf("create bootstrap password directory: %w", err)
	}
	path := bootstrapPasswordPath(username)
	if err := os.WriteFile(path, []byte(plain+"\n"), 0600); err != nil {
		return fmt.Errorf("write bootstrap password file for %s: %w", username, err)
	}
	if err := os.Chmod(path, 0600); err != nil {
		return fmt.Errorf("restrict bootstrap password file for %s: %w", username, err)
	}
	fmt.Printf("bootstrap password for %s written to %s\n", username, path)
	return nil
}

// RotateWellKnownDefaultPasswords replaces admin and support passwords that
// still match the historical default. A non-empty provisioned password is
// stored in the database and not written to disk. Otherwise a random password
// is written once to a mode 0600 file.
func RotateWellKnownDefaultPasswords(db *gorm.DB, supplied string) {
	if db == nil {
		return
	}
	for _, username := range []string{"admin", "support"} {
		if err := rotateWellKnownUser(db, username, supplied); err != nil {
			logger.Error(fmt.Sprintf("could not replace the default password for %s: %v", username, err))
		}
	}
}

func rotateWellKnownUser(db *gorm.DB, username, supplied string) error {
	user := model.TableUser{}
	err := db.Table("users").Where("username = ?", username).First(&user).Error
	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return nil
		}
		return err
	}
	if !isWellKnownDefaultHash(user.Hash) {
		return nil
	}

	plain, generated, err := replacementPassword(supplied)
	if err != nil {
		return err
	}
	hashed, err := hashPassword(plain)
	if err != nil {
		return err
	}
	if generated {
		if err := storeBootstrapPassword(username, plain); err != nil {
			return err
		}
	}
	res := db.Model(&model.TableUser{}).Where("username = ?", username).UpdateColumn("hash", hashed)
	if res.Error != nil || res.RowsAffected == 0 {
		if generated {
			removeBootstrapPassword(username)
		}
		if res.Error != nil {
			return res.Error
		}
		return fmt.Errorf("password for %s was not updated", username)
	}
	if !generated {
		fmt.Printf("replaced default password for %s with the provisioned password\n", username)
	}
	return nil
}
