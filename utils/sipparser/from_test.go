// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"testing"
)

func TestFrom(t *testing.T) {
	sm := &SipMsg{}
	str := "\"Unknown\" <sip:5554441000@0.0.0.0;user=phone;noa=national>;tag=dd737a8-co7387-INS002"
	sm.parseFrom(str)
	if sm.Error != nil {
		t.Errorf("[TestFrom] Error parsing from hdr: \"Unknown\" <sip:5554441000@0.0.0.0;user=phone;noa=national>;tag=dd737a8-co7387-INS002. Received err: %v", sm.Error)
	}
	if sm.From.Name != "Unknown" {
		t.Errorf("[TestFrom] Error parsing from hdr: \"Unknown\" <sip:5554441000@0.0.0.0;user=phone;noa=national>;tag=dd737a8-co7387-INS002. Name field should be \"Unknown\".")
	}
	if sm.From.URI.User != "5554441000" {
		t.Errorf("[TestFrom] Error parsing from hdr: \"Unknown\" <sip:5554441000@0.0.0.0;user=phone;noa=national>;tag=dd737a8-co7387-INS002. URI.User field should be \"5554441000\".")
	}
	if sm.From.Tag != "dd737a8-co7387-INS002" {
		t.Errorf("[TestFrom] Error parsing from hdr: \"Unknown\" <sip:5554441000@0.0.0.0;user=phone;noa=national>;tag=dd737a8-co7387-INS002. sm.From.Tag should be \"dd737a8-co7387-INS002\".")
	}
	str = "<sip:5554441000@0.0.0.0;user=phone;noa=national>;tag=dd737a8-co7387-INS002"
	sm.parseFrom(str)
	if sm.Error != nil {
		t.Errorf("[TestFrom] Error parsing from hdr: \"<sip:5554441000@0.0.0.0;user=phone;noa=national>;tag=dd737a8-co7387-INS002\". Received err: %v", sm.Error)
	}
	if sm.From.Name != "" {
		t.Errorf("[TestFrom] Error parsing from hdr: \"<sip:5554441000@0.0.0.0;user=phone;noa=national>;tag=dd737a8-co7387-INS002\". Name should be \"\" but received: \"%s\"", sm.From.Name)
	}
	if sm.From.URI.User != "5554441000" {
		t.Errorf("[TestFrom] Error parsing from hdr:  \"<sip:5554441000@0.0.0.0;user=phone;noa=national>;tag=dd737a8-co7387-INS002\". URI.User should be \"5554441000\" but received: \"%s\"", sm.From.URI.User)
	}
	str = "sip:+12125551212@phone2net.com;tag=887s"
	sm.parseFrom(str)
	if sm.Error != nil {
		t.Errorf("[TestFrom] Error parsing from hdr: sip:+12125551212@phone2net.com;tag=887s. Received err: %v", sm.Error)
	}
	if sm.From.Tag != "887s" {
		t.Errorf("[TestFrom] Error parsing from hdr: sip:+12125551212@phone2net.com;tag=887s. Tag should be \"887s\" but received: \"%s\".", sm.From.Tag)
	}
	sm.parseFrom("tel:+4512345678;tag=752520ac91292bae839ce09f3fa382aa")
	if sm.From.URI.User != "+4512345678" {
		t.Errorf("[TestFrom] Error parsing from hdr: tel:+4512345678;tag=752520ac91292bae839ce09f3fa382aa. User should be \"+4512345678\" but received: \"%s\".", sm.From.URI.User)
	}
	sm.parseFrom("<tel:180012345678;user=phone>;tag=sbc09033drebier-CC-3")
	if sm.From.URI.User != "180012345678" {
		t.Errorf("[TestFrom] Error parsing from hdr: <tel:180012345678;user=phone>;tag=sbc09033drebier-CC-3. User should be \"180012345678\" but received: \"%s\".", sm.From.URI.User)
	}
}
