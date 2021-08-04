// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from go standard library
import (
	"testing"
)

func TestAuthorization(t *testing.T) {
	val := "Digest username=\"foobaruser124\", realm=\"FOOBAR\", algorithm=MD5, uri=\"sip:foo.bar.com\", nonce=\"4f6d7a1d\", response=\"6a79a5c75572b0f6a18963ae04e971cf\", opaque=\"\""
	a := &Authorization{Val: val}
	err := a.parse()
	if err != nil {
		t.Errorf("[TestAuthorization] Err parsing authorization hdr.  Received: %v", err)
	}
	if a.Credentials != "Digest" {
		t.Errorf("[TestAuthorization] Err parsing authorization hdr.  Credentials should be \"Digest\" but rcvd: %v", a.Credentials)
	}
	if a.Username != "foobaruser124" {
		t.Errorf("[TestAuthorization] Err parsing authorization hdr.  Username should be \"foobaruser124\" but rcvd: %v", a.Username)
	}
	/*
		if a.GetParam("realm").Val != "FOOBAR" {
			t.Errorf("[TestAuthorization] Err parsing authorization hdr.  Called a.GetParam(\"realm\") and did not get \"FOOBAR\".  rcvd: %v", a.GetParam("realm").Val)
		}
	*/
}
