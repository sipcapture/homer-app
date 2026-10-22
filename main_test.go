package main

import (
	"bytes"
	"flag"
	"os"
	"strings"
	"testing"
)

func TestProvisioningPasswordEnvironment(t *testing.T) {
	for _, binding := range []struct {
		flagName string
		envName  string
		fallback string
	}{
		{"database-root-password", "HOMER_DATABASE_ROOT_PASSWORD", ""},
		{"database-homer-password", "HOMER_DATABASE_HOMER_PASSWORD", "homer_password"},
		{"force-password", "HOMER_FORCE_PASSWORD", ""},
	} {
		for _, scenario := range []struct {
			name     string
			envValue string
			unset    bool
			cliArgs  []string
			expected string
		}{
			{"environment", "dummy-${HOME}-$USER-'quoted' with spaces", false, nil, "dummy-${HOME}-$USER-'quoted' with spaces"},
			{"empty-environment", "", false, nil, ""},
			{"unset-environment", "", true, nil, binding.fallback},
			{"explicit-flag", "dummy-env-secret", false, []string{"-" + binding.flagName + "=cli-secret"}, "cli-secret"},
			{"explicit-empty-flag", "dummy-env-secret", false, []string{"-" + binding.flagName + "="}, ""},
		} {
			t.Run(binding.flagName+"/"+scenario.name, func(t *testing.T) {
				previousValue, wasSet := os.LookupEnv(binding.envName)
				previousFlags, previousArgs, previousAppFlags := flag.CommandLine, os.Args, appFlags
				defer func() {
					flag.CommandLine, os.Args, appFlags = previousFlags, previousArgs, previousAppFlags
					if wasSet {
						_ = os.Setenv(binding.envName, previousValue)
					} else {
						_ = os.Unsetenv(binding.envName)
					}
				}()
				var err error
				if scenario.unset {
					err = os.Unsetenv(binding.envName)
				} else {
					err = os.Setenv(binding.envName, scenario.envValue)
				}
				if err != nil {
					t.Fatal(err)
				}
				flag.CommandLine = flag.NewFlagSet("homer-test", flag.ContinueOnError)
				os.Args = append([]string{"homer-test"}, scenario.cliArgs...)
				initFlags()
				if flag.Lookup(binding.flagName).Value.String() != scenario.expected {
					t.Fatal("password precedence or literal preservation failed")
				}
				var help bytes.Buffer
				flag.CommandLine.SetOutput(&help)
				flag.PrintDefaults()
				if scenario.envValue != "" && strings.Contains(help.String(), scenario.envValue) {
					t.Fatal("help output contains an environment password")
				}
			})
		}
	}
}
