package service

import (
	"encoding/json"
	"regexp"
	"strings"

	"github.com/Jeffail/gabs/v2"
	"github.com/sipcapture/homer-app/utils/logger"
)

var (
	searchJSONBColumns = map[string]struct{}{
		"data_header":     {},
		"protocol_header": {},
	}

	safeJSONKeyPattern = regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)
)

func buildSearchFieldAllowlist(mappingJSON json.RawMessage) map[string]struct{} {
	allowlist := make(map[string]struct{})

	for _, field := range []string{"limit", "smartinput", "raw", "id", "sid", "create_date"} {
		allowlist[field] = struct{}{}
	}

	if len(mappingJSON) == 0 {
		return allowlist
	}

	sMapping, err := gabs.ParseJSON(mappingJSON)
	if err != nil {
		logger.Error("buildSearchFieldAllowlist: invalid mapping JSON: ", err)
		return allowlist
	}

	for _, val := range sMapping.Children() {
		if !val.Exists("id") {
			continue
		}
		id, ok := val.S("id").Data().(string)
		if !ok || id == "" {
			continue
		}
		allowlist[id] = struct{}{}
	}

	return allowlist
}

func validateSearchFieldName(formName string, allowlist map[string]struct{}) bool {
	if formName == "" {
		return false
	}

	if _, ok := allowlist[formName]; !ok {
		return false
	}

	if !strings.Contains(formName, ".") {
		return true
	}

	parts := strings.Split(formName, ".")
	if len(parts) != 2 {
		return false
	}

	if _, ok := searchJSONBColumns[parts[0]]; !ok {
		return false
	}

	return safeJSONKeyPattern.MatchString(parts[1])
}
