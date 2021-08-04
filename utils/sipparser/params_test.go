// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"testing"
)

func TestGetParam(t *testing.T) {
	s := "key=value"
	p := getParam(s)
	if p.Param != "key" {
		t.Errorf("[TestGetParam] Error with getParam parsing \"key=value\".")
	}
	if p.Val != "value" {
		t.Errorf("[TestGetParam] Error with getParam parsing \"key=value\". Bad value.")
	}
	s = "key"
	p = getParam(s)
	if p.Val != "" {
		t.Errorf("[TestGetParam] Error with getParam.  Received value from \"key\".")
	}
}
