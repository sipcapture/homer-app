package service

import (
	"fmt"
	"regexp"
	"strings"
)

var (
	safeInfluxIdentifier  = regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)
	safeInfluxMeasurement = regexp.MustCompile(`^[a-zA-Z0-9_.:/-]+$`)
)

func validateInfluxDatabase(name string) error {
	if !safeInfluxIdentifier.MatchString(name) {
		return fmt.Errorf("invalid influx database name: %q", name)
	}
	return nil
}

func validateInfluxRetention(name string) error {
	if name == "" || name == "none" {
		return nil
	}
	if !safeInfluxIdentifier.MatchString(name) {
		return fmt.Errorf("invalid influx retention policy: %q", name)
	}
	return nil
}

func validateInfluxMeasurement(name string) error {
	if name == "" {
		return fmt.Errorf("invalid influx measurement name: empty")
	}
	if strings.ContainsAny(name, "\"\\\n\r") {
		return fmt.Errorf("invalid influx measurement name: %q", name)
	}
	if !safeInfluxMeasurement.MatchString(name) {
		return fmt.Errorf("invalid influx measurement name: %q", name)
	}
	return nil
}

func validateInfluxFieldKey(name string) error {
	if !safeInfluxIdentifier.MatchString(name) {
		return fmt.Errorf("invalid influx field key: %q", name)
	}
	return nil
}

func validateStatisticQueryEntry(database, retention, main string, fieldKeys []string) error {
	if err := validateInfluxDatabase(database); err != nil {
		return err
	}
	if err := validateInfluxRetention(retention); err != nil {
		return err
	}
	if err := validateInfluxMeasurement(main); err != nil {
		return err
	}
	for _, key := range fieldKeys {
		if err := validateInfluxFieldKey(key); err != nil {
			return err
		}
	}
	return nil
}
