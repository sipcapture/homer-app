// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library

/* func TestRack(t *testing.T) {
	sm := &SipMsg{}
	s := "776656 1 INVITE"
	sm.parseRack(s)
	if sm.Error != nil {
		t.Errorf("[TestRack] Error parsing rack hdr: 776656 1 INVITE.  Received err: %v", sm.Error)
	}
	if sm.Rack.RseqVal != "776656" {
		t.Errorf("[TestRack] Error parsing rack hdr: 776656 1 INVITE.  RseqVal should be 776656 but received: %v", sm.Rack.RseqVal)
	}
	if sm.Rack.CseqVal != "1" {
		t.Errorf("[TestRack] Error parsing rack hdr: 776656 1 INVITE.  CseqVal should be 1 but received: %v", sm.Rack.CseqVal)
	}
	if sm.Rack.CseqMethod != "INVITE" {
		t.Errorf("[TestRack] Error parsing rack hdr: 776656 1 INVITE.  CseqMethod should be \"INVITE\" but received: \"%s\"", sm.Rack.CseqMethod)
	}
}
*/
