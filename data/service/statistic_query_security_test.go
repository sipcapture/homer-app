package service

import (
	"strings"
	"testing"

	client "github.com/influxdata/influxdb1-client/v2"
)

func TestValidateInfluxDatabase_rejectsInjection(t *testing.T) {
	cases := []struct {
		name  string
		value string
		valid bool
	}{
		{name: "allowed", value: "homer", valid: true},
		{name: "internal db", value: "_internal", valid: true},
		{name: "injection", value: "homer; SHOW USERS", valid: false},
		{name: "quote break", value: `homer" OR 1=1 --`, valid: false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err := validateInfluxDatabase(tc.value)
			if tc.valid && err != nil {
				t.Fatalf("expected valid database %q, got %v", tc.value, err)
			}
			if !tc.valid && err == nil {
				t.Fatalf("expected invalid database %q", tc.value)
			}
		})
	}
}

func TestValidateInfluxMeasurement_rejectsInjection(t *testing.T) {
	cases := []struct {
		name  string
		value string
		valid bool
	}{
		{name: "allowed dotted", value: "sip.calls", valid: true},
		{name: "quote break", value: `cpu" OR 1=1 --`, valid: false},
		{name: "semicolon", value: "cpu; SHOW USERS", valid: false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err := validateInfluxMeasurement(tc.value)
			if tc.valid && err != nil {
				t.Fatalf("expected valid measurement %q, got %v", tc.value, err)
			}
			if !tc.valid && err == nil {
				t.Fatalf("expected invalid measurement %q", tc.value)
			}
		})
	}
}

func TestValidateStatisticQueryEntry_rejectsBadFieldKey(t *testing.T) {
	err := validateStatisticQueryEntry("homer", "autogen", "cpu", []string{`value") AS x --`})
	if err == nil {
		t.Fatal("expected invalid field key to be rejected")
	}
}

func TestBuildShowRetentionPoliciesQuery_usesParameters(t *testing.T) {
	q, err := buildShowRetentionPoliciesQuery("homer")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.Contains(q.Command, "$db") || strings.Contains(q.Command, "homer") {
		t.Fatalf("expected parameterized command, got %q", q.Command)
	}
	if q.Parameters["db"] != client.Identifier("homer") {
		t.Fatalf("unexpected db parameter: %#v", q.Parameters["db"])
	}
}

func TestBuildStatisticDataQuery_usesParameters(t *testing.T) {
	q, err := buildStatisticDataQuery("homer", "autogen", "cpu", []string{"value"}, 1, 2, 10, "60s")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	for _, forbidden := range []string{"homer", "autogen", "cpu", "value"} {
		if strings.Contains(q.Command, forbidden) {
			t.Fatalf("user input leaked into command %q", q.Command)
		}
	}
	if len(q.Parameters) == 0 {
		t.Fatal("expected bind parameters")
	}
}

func TestBuildShowFieldKeysQuery_rejectsInjection(t *testing.T) {
	_, err := buildShowFieldKeysQuery(`homer; DROP DATABASE homer`, "autogen", "cpu")
	if err == nil {
		t.Fatal("expected invalid database to be rejected")
	}
}
