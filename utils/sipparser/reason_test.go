// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

/* func TestReason(t *testing.T) {
	sm := &SipMsg{}
	s := "Q.850;cause=16;text=\"NORMAL_CLEARING\""
	sm.parseReason(s)
	if sm.Reason.Proto != "Q.850" {
		t.Errorf("[TestReason] Error parsing reason hdr: Q.850;cause=16;text=\"NORMAL_CLEARING\".  Proto should be \"Q.850\" but received: " + sm.Reason.Proto)
	}
	if sm.Reason.Cause != "16" {
		t.Errorf("[TestReason] Error parsing reason hdr: Q.850;cause=16;text=\"NORMAL_CLEARING\".  Cause should be \"16\" but received: " + sm.Reason.Cause)
	}
	if sm.Reason.Text != "NORMAL_CLEARING" {
		t.Errorf("[TestReason] Error parsing reason hdr: Q.850;cause=16;text=\"NORMAL_CLEARING\". Text should be \"NORMAL_CLEARING\" but received: " + sm.Reason.Text)
	}
	s = "Q.850;cause=102"
	sm.parseReason(s)
	if sm.Reason.Proto != "Q.850" {
		t.Errorf("[TestReason] Error parsing reason hdr: Q.850;cause=102.  Proto should be \"Q.850\" but received: " + sm.Reason.Proto)
	}
	if sm.Reason.Cause != "102" {
		t.Errorf("[TestReason] Error parsing reason hdr: Q.850;cause=102.  Cause should be \"102\" but received: " + sm.Reason.Cause)
	}
}
*/
