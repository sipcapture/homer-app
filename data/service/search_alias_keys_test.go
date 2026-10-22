package service

import (
	"net"
	"testing"
)

func TestSearchAliasIPPortKeys(t *testing.T) {
	tests := []struct {
		name        string
		srcIP       string
		dstIP       string
		srcPort     string
		dstPort     string
		wantSrcKey  string
		wantDstKey  string
		wantSrcPort int
		wantDstPort int
	}{
		{
			name:        "ipv4 uses each endpoint",
			srcIP:       "192.0.2.1",
			dstIP:       "198.51.100.2",
			srcPort:     "5060",
			dstPort:     "5060",
			wantSrcKey:  "192.0.2.1:5060",
			wantDstKey:  "198.51.100.2:5060",
			wantSrcPort: 5060,
			wantDstPort: 5060,
		},
		{
			name:        "ipv4 same host keeps ports apart",
			srcIP:       "192.0.2.1",
			dstIP:       "192.0.2.1",
			srcPort:     "5060",
			dstPort:     "5080",
			wantSrcKey:  "192.0.2.1:5060",
			wantDstKey:  "192.0.2.1:5080",
			wantSrcPort: 5060,
			wantDstPort: 5080,
		},
		{
			name:        "ipv6 brackets each endpoint",
			srcIP:       "2001:db8::1",
			dstIP:       "2001:db8::2",
			srcPort:     "5060",
			dstPort:     "5080",
			wantSrcKey:  "[2001:db8::1]:5060",
			wantDstKey:  "[2001:db8::2]:5080",
			wantSrcPort: 5060,
			wantDstPort: 5080,
		},
		{
			name:        "mixed families",
			srcIP:       "192.0.2.10",
			dstIP:       "2001:db8::10",
			srcPort:     "5062",
			dstPort:     "5064",
			wantSrcKey:  "192.0.2.10:5062",
			wantDstKey:  "[2001:db8::10]:5064",
			wantSrcPort: 5062,
			wantDstPort: 5064,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			srcKey, dstKey, srcIP, dstIP, srcPort, dstPort := searchAliasIPPortKeys(tt.srcIP, tt.dstIP, tt.srcPort, tt.dstPort)
			if srcKey != tt.wantSrcKey || dstKey != tt.wantDstKey {
				t.Fatalf("keys = %q, %q; want %q, %q", srcKey, dstKey, tt.wantSrcKey, tt.wantDstKey)
			}
			if srcPort != tt.wantSrcPort || dstPort != tt.wantDstPort {
				t.Fatalf("ports = %d, %d; want %d, %d", srcPort, dstPort, tt.wantSrcPort, tt.wantDstPort)
			}
			if !srcIP.Equal(net.ParseIP(tt.srcIP)) || !dstIP.Equal(net.ParseIP(tt.dstIP)) {
				t.Fatalf("parsed %v, %v; want %s, %s", srcIP, dstIP, tt.srcIP, tt.dstIP)
			}
		})
	}
}
