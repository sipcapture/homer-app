// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"errors"
)

// Rack is a struct that holds the parsed rack hdr
// The fields are as follows:
// -- Val is the raw value
// -- RseqVal is the rseq value from the rack hdr
// -- CseqVal is the cseq value from the rack hdr
// -- CseqMethod is the method from the cseq hdr
type Rack struct {
	Val        string
	RseqVal    string
	CseqVal    string
	CseqMethod string
}

// parse parses the .Val of the Rack struct
func (r *Rack) parse() error {
	r.Val = cleanWs(r.Val)
	pos := make([]int, 0)
	for i := range r.Val {
		if r.Val[i] == ' ' {
			pos = append(pos, i)
		}
	}
	if len(pos) != 2 {
		return errors.New("Rack.parse err: could not locate two LWS")
	}
	r.RseqVal = r.Val[0:pos[0]]
	r.CseqVal = r.Val[pos[0]+1 : pos[1]]
	if len(r.Val)-1 > pos[1] {
		r.CseqMethod = r.Val[pos[1]+1:]
		return nil
	}
	return errors.New("Rack.parse err: value of rack ends in LWS")
}
