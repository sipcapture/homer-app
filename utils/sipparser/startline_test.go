// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"testing"
)

func TestStartLine(t *testing.T) {
	str := "SIP/2.0 487 Request Cancelled"
	s := &StartLine{Val: str}
	s.run()
	if s.Type != SIP_RESPONSE {
		t.Error("[TestStartLine] Error parsing startline: SIP/2.0 487 Request Cancelled.  s.Type should be \"RESPONSE\".")
	}
	if s.Resp != "487" {
		t.Error("[TestStartLine] Error parsing startline: SIP/2.0 487 Request Cancelled.  s.Resp should be \"487\".")
	}
	if s.RespText != "Request Cancelled" {
		t.Error("[TestStartLine] Error parsing startline: SIP/2.0 487 Request Cancelled.  s.RespText should be \"Request Cancelled\".")
	}
	str = "1412@34922@336312786@1.2.3.4:5061;transport=tcp;user=phone@home1.2.3.4                                            111111111"
	s = ParseStartLine(str)
	if s.Error == nil {
		t.Error("[TestStartLine] Error parsing startline.  s.Error should not be nil.")
	}
	str = "dlskmgkfmdg ldf,l,"
	s = ParseStartLine(str)
	if s.Error == nil {
		t.Error("[TestStartLine] Error parsing startline.  s.Error should not be nil for string: \"dlskmgkfmdg ldf,l,\".")
	}
	str = "INVITE sip:+15554440000@0.0.0.0;user=phone SIP/2.0"
	s = ParseStartLine(str)
	if s.Error != nil {
		t.Errorf("[TestStartLine] Got error when parsing startline: \"INVITE sip:+15554440000@0.0.0.0;user=phone SIP/2.0\".  Received err: %v", s.Error)
	}
	if s.Type != SIP_REQUEST {
		t.Error("[TestStartLine] Got error when parsing startline: \"INVITE sip:+15554440000@0.0.0.0;user=phone SIP/2.0\".  s.Type should be \"Request\".")
	}
	if s.Method != SIP_METHOD_INVITE {
		t.Error("[TestStartLine] Got error when parsing startline: \"INVITE sip:+15554440000@0.0.0.0;user=phone SIP/2.0\".  s.Method should be \"INVITE\".")
	}
	if s.Proto != "SIP" {
		t.Errorf("[TestStartLine] Got error when startline: \"INVITE sip:+15554440000@0.0.0.0;user=phone SIP/2.0\".  s.Proto should be \"SIP\".  Received: \"%s\"", s.Proto)
	}
	if s.Version != "2.0" {
		t.Errorf("[TestStartLine] Got error when parsing startline: \"INVITE sip:+15554440000@0.0.0.0;user=phone SIP/2.0\".  s.Version should be \"2.0\". Received: \"%s\"", s.Version)
	}
	// throwing this in to make sure we don't toss an index error
	str = "INVITE foo@bar.com SIP/"
	s = ParseStartLine(str)
	if s.Error == nil {
		t.Error("[TestStartLine] Should have a no version err when parsing request line: \"INVITE foo@bar.com SIP/\".")
	}
}
