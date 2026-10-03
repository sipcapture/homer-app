package heputils

import (
	"os"
	"path/filepath"
	"testing"
)

func TestRestrictSecretFile(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name    string
		mode    os.FileMode
		want    os.FileMode
		changed bool
	}{
		{name: "world readable", mode: 0644, want: 0600, changed: true},
		{name: "group readable", mode: 0640, want: 0600, changed: true},
		{name: "executable world", mode: 0755, want: 0700, changed: true},
		{name: "already owner only", mode: 0600, want: 0600, changed: false},
		{name: "owner read only stays", mode: 0400, want: 0400, changed: false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			dir := t.TempDir()
			path := filepath.Join(dir, "webapp_config.json")
			if err := os.WriteFile(path, []byte("{}\n"), tc.mode); err != nil {
				t.Fatal(err)
			}

			changed, err := RestrictSecretFile(path)
			if err != nil {
				t.Fatal(err)
			}
			if changed != tc.changed {
				t.Fatalf("changed = %v, want %v", changed, tc.changed)
			}
			info, err := os.Stat(path)
			if err != nil {
				t.Fatal(err)
			}
			if got := info.Mode().Perm(); got != tc.want {
				t.Fatalf("mode = %o, want %o", got, tc.want)
			}
		})
	}
}

func TestRestrictSecretFileMissing(t *testing.T) {
	t.Parallel()
	_, err := RestrictSecretFile(filepath.Join(t.TempDir(), "missing.json"))
	if err == nil {
		t.Fatal("expected an error for a missing file")
	}
}
