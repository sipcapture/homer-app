// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library

// AcceptParam is just a key:value pair of params for the accept
// header
type AcceptParam struct {
	Type string
	Val  string
}

// Accept is a struct that holds the following:
// -- the raw value
// -- a slice of parced AcceptParam
type Accept struct {
	Val    string
	Params []*AcceptParam
}

// addParam is called when you want to add a parameter to the accept
// struct
func (a *Accept) addParam(s string) {
	for i := range s {
		if s[i] == '/' {
			if len(s)-1 > i {
				if a.Params == nil {
					a.Params = []*AcceptParam{&AcceptParam{Type: cleanWs(s[0:i]), Val: cleanWs(s[i+1:])}}
					return
				}
				a.Params = append(a.Params, &AcceptParam{Type: cleanWs(s[0:i]), Val: cleanWs(s[i+1:])})
				return
			}
			return
		}
	}
}

// parse just gets a comma seperated list of the parameters from
// the .Val and calls addparam on each of the parameters
func (a *Accept) parse() {
	cs := getCommaSeperated(a.Val)
	if cs == nil {
		a.addParam(a.Val)
		return
	}
	for i := range cs {
		a.addParam(cs[i])
	}
}
