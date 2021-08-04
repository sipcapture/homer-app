// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library

/* // TestAccept tests the accept header and parsing functions
func TestAccept(t *testing.T) {
	sm := &SipMsg{}
	s := "application/sdp"
	sm.parseAccept(s)
	if sm.Accept.Val != "application/sdp" {
		t.Errorf("[TestAccept] Error parsing accept hdr: application/sdp.  sm.Accept.Val should be application/sdp but received: " + sm.Accept.Val)
	}
	if len(sm.Accept.Params) != 1 {
		t.Errorf("[TestAccept] Error parsing accept hdr: application/sdp.  sm.Accept.Params should have length of 1.")
	}
	if sm.Accept.Params[0].Type != "application" {
		t.Errorf("[TestAccept] Error parsing accept hdr: application/sdp.  sm.Accept.Params[0].Type should be \"application\".  Received: %q", sm.Accept.Params[0].Type)
	}
	if sm.Accept.Params[0].Val != "sdp" {
		t.Errorf("[TestAccept] Error parsing accept hdr: application/sdp.  sm.Accept.Params[0].Val should be \"sdp\" but received: %q", sm.Accept.Params[0].Val)
	}
}
*/
