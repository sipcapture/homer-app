// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"testing"
)

func TestCseq(t *testing.T) {
	sm := &SipMsg{}
	sm.parseCseq("100 INVITE")
	if sm.Error != nil {
		t.Errorf("[TestCseq] Error parsing cseq: \"100 INVITE\". Received err: %v", sm.Error)
	}
	if sm.Cseq.Digit != "100" {
		t.Errorf("[TestCseq] Error parsing cseq: \"100 INVITE\".  Digit should be 100.")
	}
	if sm.Cseq.Method != "INVITE" {
		t.Errorf("[TestCseq] Error parsing cseq: \"100 INVITE\".  Method should be \"INVITE\".")
	}
	sm.parseCseq("1112423100   REGISTER   ")
	if sm.Error != nil {
		t.Errorf("[TestCseq] Error parsing cseq: \"1112423100   REGISTER   \". Received err: %v", sm.Error)
	}
	if sm.Cseq.Digit != "1112423100" {
		t.Errorf("[TestCseq] Error parsing cseq: \"1112423100   REGISTER   \".  Digit should be 1112423100.")
	}
	if sm.Cseq.Method != "REGISTER" {
		t.Errorf("[TestCseq] Error parsing cseq: \"1112423100   REGISTER   \".  Method should be \"REGISTER\".")
	}
}
