package service

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestValidateSearchFieldName_rejectsSQLInjection(t *testing.T) {
	allowlist := buildSearchFieldAllowlist(json.RawMessage(`[
		{"id":"data_header.callid","type":"string"},
		{"id":"protocol_header.srcIp","type":"string"},
		{"id":"sid","type":"string"},
		{"id":"raw","type":"string"}
	]`))

	cases := []struct {
		name  string
		field string
		want  bool
	}{
		{name: "allowed dotted field", field: "data_header.callid", want: true},
		{name: "allowed column", field: "sid", want: true},
		{name: "allowed raw", field: "raw", want: true},
		{name: "injection in identifier", field: "1=1) OR (SELECT pg_sleep(5)) IN (", want: false},
		{name: "unknown field", field: "evil_column", want: false},
		{name: "jsonb escape attempt", field: "data_header.callid' OR 1=1--", want: false},
		{name: "extra path segment", field: "data_header.callid.extra", want: false},
		{name: "invalid jsonb column", field: "users.password", want: false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := validateSearchFieldName(tc.field, allowlist); got != tc.want {
				t.Fatalf("validateSearchFieldName(%q) = %v, want %v", tc.field, got, tc.want)
			}
		})
	}
}

func TestBuildQuery_rejectsInjectedFieldName(t *testing.T) {
	mappingJSON := json.RawMessage(`[
		{"id":"data_header.callid","type":"string"},
		{"id":"sid","type":"string"}
	]`)

	elems := []interface{}{
		map[string]interface{}{
			"name":  "1=1) OR (SELECT 1) IN (",
			"value": "x",
			"type":  "string",
		},
	}

	sql, _, values := buildQuery(elems, false, mappingJSON, 0)
	if sql != "" {
		t.Fatalf("expected empty SQL for rejected field, got %q", sql)
	}
	if len(values) != 0 {
		t.Fatalf("expected no bind values, got %v", values)
	}
}

func TestBuildQuery_rejectsInjectedSmartinputField(t *testing.T) {
	mappingJSON := json.RawMessage(`[
		{"id":"data_header.callid","type":"string"}
	]`)

	elems := []interface{}{
		map[string]interface{}{
			"name":  "smartinput",
			"value": "1=1) OR (SELECT 1) IN ( = x",
			"type":  "string",
		},
	}

	sql, _, values := buildQuery(elems, false, mappingJSON, 0)
	if sql != "" {
		t.Fatalf("expected empty SQL for rejected smartinput field, got %q", sql)
	}
	if len(values) != 0 {
		t.Fatalf("expected no bind values, got %v", values)
	}
}

func TestBuildQuery_allowsMappedField(t *testing.T) {
	mappingJSON := json.RawMessage(`[
		{"id":"data_header.callid","type":"string"}
	]`)

	elems := []interface{}{
		map[string]interface{}{
			"name":  "data_header.callid",
			"value": "abc@example.com",
			"type":  "string",
		},
	}

	sql, _, values := buildQuery(elems, false, mappingJSON, 0)
	if sql == "" {
		t.Fatal("expected SQL fragment for allowed field")
	}
	if !strings.Contains(sql, "data_header->>'callid'") {
		t.Fatalf("unexpected SQL: %q", sql)
	}
	if len(values) != 1 || values[0] != "abc@example.com" {
		t.Fatalf("unexpected bind values: %v", values)
	}
}

func TestValidateSearchTableKey_rejectsSQLInjection(t *testing.T) {
	allowed := map[string]json.RawMessage{
		"1_call":    json.RawMessage(`[]`),
		"5_default": json.RawMessage(`[]`),
	}

	cases := []struct {
		name string
		key  string
		want bool
	}{
		{name: "allowed profile", key: "1_call", want: true},
		{name: "allowed numeric profile", key: "5_default", want: true},
		{name: "injection in table key", key: `1_default" WHERE pg_sleep(3) AND "x`, want: false},
		{name: "unknown profile", key: "99_evil", want: false},
		{name: "empty key", key: "", want: false},
		{name: "missing underscore", key: "1call", want: false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := validateSearchTableKey(tc.key, allowed); got != tc.want {
				t.Fatalf("validateSearchTableKey(%q) = %v, want %v", tc.key, got, tc.want)
			}
		})
	}
}

func TestBuildSearchTableName(t *testing.T) {
	allowed := map[string]json.RawMessage{
		"1_call": json.RawMessage(`[]`),
	}

	table, ok := buildSearchTableName("1_call", allowed)
	if !ok {
		t.Fatal("expected allowed key to succeed")
	}
	if table != "hep_proto_1_call" {
		t.Fatalf("unexpected table name: %q", table)
	}

	_, ok = buildSearchTableName(`1_call"; SELECT pg_sleep(1); --`, allowed)
	if ok {
		t.Fatal("expected injection attempt to be rejected")
	}
}
