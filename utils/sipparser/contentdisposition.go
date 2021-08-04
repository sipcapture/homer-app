// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"strings"
)

// ContentDisposition is a struct that holds a parsed
// content-disposition hdr:
// -- Val is the raw value
// -- DispType is the display type
// -- Params is slice of parameters
type ContentDisposition struct {
	Val      string
	DispType string
	Params   []*Param
}

func (c *ContentDisposition) addParam(s string) {
	if s == "" {
		return
	}
	if c.Params == nil {
		c.Params = []*Param{getParam(s)}
		return
	}
	c.Params = append(c.Params, getParam(s))
}

func (c *ContentDisposition) parse() {
	charPos := strings.IndexRune(c.Val, ';')
	if charPos == -1 {
		c.DispType = c.Val
		return
	}
	c.DispType = c.Val[0:charPos]
	if len(c.Val)-1 > charPos {
		params := strings.Split(c.Val[charPos+1:], ";")
		for i := range params {
			c.addParam(params[i])
		}
	}
	return
}
