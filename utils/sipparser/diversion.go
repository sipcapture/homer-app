// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"errors"
	"fmt"
)

type parseDivStateFn func(d *Diversion) parseDivStateFn

type Diversion struct {
	Error   error
	Val     string
	Name    string
	URI     *URI
	Counter string
	Reason  string
	Privacy string
	Params  []*Param
}

func (r *Diversion) addParam(s string) {
	p := getParam(s)
	switch {
	case p.Param == "reason":
		r.Reason = p.Val
	case p.Param == "privacy":
		r.Privacy = p.Val
	case p.Param == "counter":
		r.Counter = p.Val
	default:
		switch {
		case r.Params == nil:
			r.Params = []*Param{p}
		default:
			r.Params = append(r.Params, p)
		}
	}
}

func (d *Diversion) parse() {
	for state := parseDiv; state != nil; {
		state = state(d)
	}
}

func parseDiv(d *Diversion) parseDivStateFn {
	if d.Error != nil {
		return nil
	}
	d.Name, _ = getName(d.Val)
	return parseDivGetUri
}

func parseDivGetUri(d *Diversion) parseDivStateFn {
	left := 0
	right := 0
	for i := range d.Val {
		if d.Val[i] == '<' && left == 0 {
			left = i
		}
		if d.Val[i] == '>' && right == 0 {
			right = i
		}
	}
	if left < right {
		d.URI = ParseURI(d.Val[left+1 : right])
		if d.URI.Error != nil {
			d.Error = fmt.Errorf("parseDivGetUri err: received err getting uri: %v", d.URI.Error)
			return nil
		}
		return parseDivGetParams
	}
	d.Error = errors.New("parseDivGetUri err: could not locate bracks in uri")
	return nil
}

func parseDivGetParams(d *Diversion) parseDivStateFn {
	var pos []int
	right := 0
	for i := range d.Val {
		if d.Val[i] == '>' && right == 0 {
			right = i
		}
	}
	if len(d.Val) > right+1 {
		pos = make([]int, 0)
		for i := range d.Val[right+1:] {
			if d.Val[right+1:][i] == ';' {
				pos = append(pos, i)
			}
		}
	}
	if pos == nil {
		return nil
	}
	for i := range pos {
		if len(pos)-1 == i {
			if len(d.Val[right+1:])-1 > pos[i]+1 {
				d.addParam(d.Val[right+1:][pos[i]+1:])
			}
		}
		if len(pos)-1 > i {
			d.addParam(d.Val[right+1:][pos[i]+1 : pos[i+1]])
		}
	}
	return nil
}
