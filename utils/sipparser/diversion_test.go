// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"testing"
)

func TestDiv(t *testing.T) {
	sm := &SipMsg{}
	s := "\"Unknown\" <sip:+5558887777@0.0.0.0>;reason=unconditional;privacy=off;counter=1"
	sm.parseRemotePartyId(s)
	if sm.Error != nil {
		t.Errorf("[TestDiv] Error parsing div hdr: \"Unknown\" <sip:+5558887777@0.0.0.0>;reason=unconditional;privacy=off;counter=1.  Received err: %v", sm.Error)
	}
	if sm.RemotePartyId.Name != "Unknown" {
		t.Error("[TestDiv] Error parsing div hdr: \"Unknown\" <sip:+5558887777@0.0.0.0>;reason=unconditional;privacy=off;counter=1.  Name should be \"Unknown\".")
	}
	if sm.RemotePartyId.Privacy != "off" {
		t.Error("[TestDiv] Error parsing div hdr: \"Unknown\" <sip:+5558887777@0.0.0.0>;reason=unconditional;privacy=off;counter=1.  Privacy should be \"off\".")
	}
}
