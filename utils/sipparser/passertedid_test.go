// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"testing"
)

func TestPAssertedId(t *testing.T) {
	s := "\"VoIP Call\"<sip:8885551000@0.0.0.0>"
	p := &PAssertedId{Val: s}
	p.parse()
	if p.Error != nil {
		t.Errorf("[TestPAssertedId] Error parsing p-asserted-id hdr: \"VoIP Call\"<sip:8885551000@0.0.0.0>.  Received err: %v", p.Error)
	}
	if p.Name != "VoIP Call" {
		t.Errorf("[TestPAssertedId] Error parsing p-assertd-id hdr: \"VoIP Call\"<sip:8885551000@0.0.0.0>. Name should be \"VoIP Call\" but received: \"%s\"", p.Name)
	}
	if p.URI == nil {
		t.Error("[TestPAssertedId] Error parsing p-asserted-id hdr: \"VoIP Call\"<sip:8885551000@0.0.0.0>.  No URI in parsed hdr.")
	}
	if p.Params != nil {
		t.Error("[TestPAssertedId] Error parsing p-asserted-id hdr: \"VoIP Call\"<sip:8885551000@0.0.0.0>.  p.Params should be nil.")
	}
	s = "bad header"
	p = &PAssertedId{Val: s}
	p.parse()
	if p.Error == nil {
		t.Error("[TestPAssertedId] Should have received an err when parsing bad hdr: \"bad header\".")
	}
	s = "<sip:4.71.122.181:5060;user=phone>"
	p = &PAssertedId{Val: s}
	p.parse()
	if p.URI == nil {
		t.Error("[TestPAssertedId] No URI for parsing p-asserted-id hdr: <sip:4.71.122.181:5060;user=phone>")
	}
}
