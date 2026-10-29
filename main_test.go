package main

import (
	"flag"
	"os"
	"os/exec"
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
		{"update-ui-password", "HOMER_UPDATE_UI_PASSWORD", ""},
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
			})
		}
	}
}

func TestPasswordEnvironmentHelpSubprocess(t *testing.T) {
	mode := os.Getenv("HOMER_PASSWORD_HELP_TEST_MODE")
	if mode == "" {
		return
	}

	flag.CommandLine = flag.NewFlagSet("homer-app", flag.ExitOnError)
	os.Args = []string{"homer-app"}
	if mode == "help" {
		os.Args = append(os.Args, "-h")
	} else {
		os.Args = append(os.Args, "-unknown-password-test-flag")
	}
	initFlags()
	checkHelpVersionFlags()
}

func TestPasswordEnvironmentNotPrintedByHelpOrParseErrors(t *testing.T) {
	secrets := map[string]string{
		"HOMER_DATABASE_ROOT_PASSWORD":  "dummy-root-secret-${HOME}",
		"HOMER_DATABASE_HOMER_PASSWORD": "dummy-db-secret-${HOME}",
		"HOMER_FORCE_PASSWORD":          "dummy-force-secret-${HOME}",
		"HOMER_UPDATE_UI_PASSWORD":      "dummy-ui-secret-${HOME}",
	}

	for _, mode := range []string{"help", "invalid-flag"} {
		t.Run(mode, func(t *testing.T) {
			t.Setenv("HOMER_PASSWORD_HELP_TEST_MODE", mode)
			for name, value := range secrets {
				t.Setenv(name, value)
			}

			command := exec.Command(os.Args[0], "-test.run=^TestPasswordEnvironmentHelpSubprocess$")
			output, err := command.CombinedOutput()
			if mode == "help" && err != nil {
				t.Fatalf("help subprocess failed: %v", err)
			}
			if mode == "invalid-flag" {
				exitError, ok := err.(*exec.ExitError)
				if !ok || exitError.ExitCode() != 2 {
					t.Fatalf("invalid-flag subprocess error = %v, want exit code 2", err)
				}
			}
			for _, secret := range secrets {
				if strings.Contains(string(output), secret) {
					t.Fatal("help or parse-error output disclosed an environment password")
				}
			}
		})
	}
}
