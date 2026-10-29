package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func TestClientIPExtractor(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		mode    string
		cidrs   []string
		peer    string
		xff     string
		realIP  string
		want    string
		wantErr bool
	}{
		{
			name:   "public peer ignores spoofed xff and x-real-ip",
			mode:   "xff",
			peer:   "203.0.113.10:1234",
			xff:    "198.51.100.77",
			realIP: "198.51.100.77",
			want:   "203.0.113.10",
		},
		{
			name: "private proxy keeps the appended client and drops the spoofed prefix",
			mode: "xff",
			peer: "10.1.2.3:443",
			xff:  "198.51.100.77, 203.0.113.9",
			want: "203.0.113.9",
		},
		{
			name: "loopback proxy is trusted",
			mode: "xff",
			peer: "127.0.0.1:8080",
			xff:  "203.0.113.9",
			want: "203.0.113.9",
		},
		{
			name: "empty mode is xff",
			peer: "203.0.113.10:1234",
			xff:  "198.51.100.77",
			want: "203.0.113.10",
		},
		{
			name:   "direct ignores headers",
			mode:   "direct",
			peer:   "203.0.113.10:1234",
			xff:    "198.51.100.77",
			realIP: "198.51.100.1",
			want:   "203.0.113.10",
		},
		{
			name:   "real-ip from a public peer is ignored",
			mode:   "real-ip",
			peer:   "203.0.113.10:1234",
			realIP: "198.51.100.77",
			want:   "203.0.113.10",
		},
		{
			name:   "real-ip from a private peer is used",
			mode:   "x-real-ip",
			peer:   "192.168.1.1:80",
			realIP: "203.0.113.9",
			want:   "203.0.113.9",
		},
		{
			name:  "extra cidr trusts a public load balancer",
			mode:  "x-forwarded-for",
			cidrs: []string{" 203.0.113.0/24 "},
			peer:  "203.0.113.10:443",
			xff:   "198.51.100.8",
			want:  "198.51.100.8",
		},
		{
			name:    "bad cidr",
			mode:    "xff",
			cidrs:   []string{"not-a-cidr"},
			wantErr: true,
		},
		{
			name:    "unknown mode",
			mode:    "guess",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			extractor, _, err := clientIPExtractor(tt.mode, tt.cidrs)
			if tt.wantErr {
				if err == nil {
					t.Fatal("expected an error")
				}
				return
			}
			if err != nil {
				t.Fatalf("clientIPExtractor: %v", err)
			}
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			req.RemoteAddr = tt.peer
			if tt.xff != "" {
				req.Header.Set("X-Forwarded-For", tt.xff)
			}
			if tt.realIP != "" {
				req.Header.Set("X-Real-IP", tt.realIP)
			}
			if got := extractor(req); got != tt.want {
				t.Fatalf("client IP = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestProxyOverwritesSpoofedXRealIP(t *testing.T) {
	t.Parallel()

	var got string
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		got = r.Header.Get("X-Real-IP")
		w.WriteHeader(http.StatusNoContent)
	}))
	t.Cleanup(upstream.Close)

	target, err := url.Parse(upstream.URL)
	if err != nil {
		t.Fatal(err)
	}
	extractor, _, err := clientIPExtractor("xff", nil)
	if err != nil {
		t.Fatal(err)
	}

	e := echo.New()
	e.IPExtractor = extractor
	e.Use(middleware.ProxyWithConfig(middleware.ProxyConfig{
		Balancer: middleware.NewRoundRobinBalancer([]*middleware.ProxyTarget{{URL: target}}),
	}))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "203.0.113.10:1234"
	req.Header.Set("X-Real-IP", "198.51.100.77")
	req.Header.Set("X-Forwarded-For", "198.51.100.77")
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusNoContent {
		body, _ := io.ReadAll(rec.Body)
		t.Fatalf("proxy status = %d body = %s", rec.Code, body)
	}
	if got != "203.0.113.10" {
		t.Fatalf("upstream X-Real-IP = %q, want the TCP peer", got)
	}
}
