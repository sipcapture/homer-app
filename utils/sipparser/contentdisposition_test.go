// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library

/* func TestContentDisposition(t *testing.T) {
	sm := &SipMsg{}
	s := "session; handling=required"
	sm.parseContentDisposition(s)
	if sm.ContentDisposition.Val != "session; handling=required" {
		t.Errorf("[TestContentDisposition] Error parsing content-disposition hdr: session; handling=required.  sm.ContentDisposition.Val should be \"session; handling=required\" but received: \"%s\"", sm.ContentDisposition.Val)
	}
	if sm.ContentDisposition.DispType != "session" {
		t.Errorf("[TestContentDisposition] Error parsing content-disposition hdr: session; handling=required.  sm.ContentDisposition.DispType should be \"session\" but received: \"%s\"", sm.ContentDisposition.DispType)
	}
	if len(sm.ContentDisposition.Params) != 1 {
		t.Errorf("[TestContentDisposition] Error parsing content-disposition hdr: session; handling=required.  Length of sm.ContentDisposition.Params should be 1 but instead is: %d", len(sm.ContentDisposition.Params))
	}
	if sm.ContentDisposition.Params[0].Param != "handling" {
		t.Errorf("[TestContentDisposition] Error parsing content-disposition hdr: session; handling=required.  sm.ContentDisposition.Params[0].Param should be \"handling\" but received: \"%s\"", sm.ContentDisposition.Params[0].Param)
	}
	if sm.ContentDisposition.Params[0].Val != "required" {
		t.Errorf("[TestContentDisposition] Error parsing content-disposition hdr: session; handling=required.  sm.ContentDisposition.Params[0].Val should be \"required\" but received: \"%s\"", sm.ContentDisposition.Params[0].Val)
	}
}
*/
