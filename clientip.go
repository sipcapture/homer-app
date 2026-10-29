package main

import (
	"fmt"
	"net"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/sipcapture/homer-app/utils/logger"
	"github.com/spf13/viper"
)

// configureClientIP sets Echo#IPExtractor before any proxy or RealIP use.
// Without it, Echo forwards a client-supplied X-Real-IP upstream and RealIP
// trusts X-Forwarded-For. GHSA-99jh-6h7p-pp36, GHSA-246p-cpwv-v3jq.
func configureClientIP(e *echo.Echo) error {
	mode := viper.GetString("http_settings.ip_extract")
	extractor, resolved, err := clientIPExtractor(mode, viper.GetStringSlice("http_settings.trusted_proxies"))
	if err != nil {
		return err
	}
	e.IPExtractor = extractor
	logger.Info(fmt.Sprintf("HTTP client IP extractor: %s", resolved))
	return nil
}

// clientIPExtractor builds the Echo IP extractor.
// mode is xff (default), real-ip, or direct.
// extra CIDRs are trusted in addition to loopback, link-local, and private nets.
func clientIPExtractor(mode string, extraCIDRs []string) (echo.IPExtractor, string, error) {
	var opts []echo.TrustOption
	for _, raw := range extraCIDRs {
		cidr := strings.TrimSpace(raw)
		if cidr == "" {
			continue
		}
		_, network, err := net.ParseCIDR(cidr)
		if err != nil {
			return nil, "", fmt.Errorf("http_settings.trusted_proxies: %q: %w", cidr, err)
		}
		opts = append(opts, echo.TrustIPRange(network))
	}

	switch strings.ToLower(strings.TrimSpace(mode)) {
	case "", "xff", "x-forwarded-for":
		return echo.ExtractIPFromXFFHeader(opts...), "xff", nil
	case "real-ip", "x-real-ip":
		return echo.ExtractIPFromRealIPHeader(opts...), "real-ip", nil
	case "direct":
		return echo.ExtractIPDirect(), "direct", nil
	default:
		return nil, "", fmt.Errorf("http_settings.ip_extract: unknown mode %q", mode)
	}
}
