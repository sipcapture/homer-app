package migration

import (
	"strings"
	"testing"

	"github.com/sipcapture/homer-app/migration/jsonschema"
	"golang.org/x/crypto/bcrypt"
)

func TestSeedUserPasswordsUsesOperatorValue(t *testing.T) {
	admin, support, generated, err := seedUserPasswords("operator-secret")
	if err != nil {
		t.Fatal(err)
	}
	if generated {
		t.Fatal("operator password was replaced")
	}
	if admin != "operator-secret" || support != "operator-secret" {
		t.Fatalf("admin=%q support=%q", admin, support)
	}
}

func TestSeedUserPasswordsRefusesHistoricalDefault(t *testing.T) {
	for _, supplied := range []string{"", jsonschema.DisallowedDefaultPassword} {
		admin, support, generated, err := seedUserPasswords(supplied)
		if err != nil {
			t.Fatal(err)
		}
		if !generated {
			t.Fatalf("supplied %q was stored", supplied)
		}
		if admin == "" || support == "" || admin == support {
			t.Fatalf("admin=%q support=%q", admin, support)
		}
		if admin == jsonschema.DisallowedDefaultPassword || support == jsonschema.DisallowedDefaultPassword {
			t.Fatal("historical default was generated")
		}
		if strings.ContainsAny(admin, " \n") || strings.ContainsAny(support, " \n") {
			t.Fatal("generated password is not a single token")
		}
	}
}

func TestUpdateHomerUserRefusesHistoricalDefault(t *testing.T) {
	err := UpdateHomerUser(nil, "homer_config", "admin", jsonschema.DisallowedDefaultPassword)
	if err == nil {
		t.Fatal("historical default was accepted")
	}
}

func TestIsWellKnownDefaultHash(t *testing.T) {
	known, err := bcrypt.GenerateFromPassword([]byte(jsonschema.DisallowedDefaultPassword), bcrypt.MinCost)
	if err != nil {
		t.Fatal(err)
	}
	other, err := bcrypt.GenerateFromPassword([]byte("operator-secret"), bcrypt.MinCost)
	if err != nil {
		t.Fatal(err)
	}
	if !isWellKnownDefaultHash(string(known)) {
		t.Fatal("historical hash was not recognized")
	}
	if isWellKnownDefaultHash(string(other)) || isWellKnownDefaultHash("") {
		t.Fatal("unrelated hash was treated as the historical default")
	}
}
