// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from go standard library

// Param is just a struct that holds a parameter and a value
// As an example of this would be something like user=phone
type Param struct {
	Param string
	Val   string
}

// getParam is just a convenience function to pass a string
// and get a *Param
func getParam(s string) *Param {
	p := new(Param)
	for i := range s {
		if s[i] == '=' {
			p.Param = cleanWs(s[0:i])
			if i+1 < len(s) {
				p.Val = cleanWs(s[i+1:])
				return p
			}
			return p
		}
	}
	p.Param = cleanWs(s)
	return p
}
