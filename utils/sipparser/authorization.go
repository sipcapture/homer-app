// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from go standard library
import (
	"errors"
	"strings"

	"github.com/sipcapture/homer-app/utils/sipparser/internal"
)

type Authorization struct {
	Val         string
	Credentials string
	Username    string
	//Params      []*Param
}

/*
func (a *Authorization) GetParam(param string) *Param {
	if a.Params == nil {
		return nil
	}
	for i := range a.Params {
		if a.Params[i].Param == param {
			return a.Params[i]
		}
	}
	return nil
}
*/
func (a *Authorization) parse() error {
	pos := strings.IndexRune(a.Val, ' ')
	if pos == -1 {
		return errors.New("Authorization.parse err: no LWS found")
	}
	a.Credentials = a.Val[0:pos]
	if len(a.Val)-1 <= pos {
		return errors.New("Authorization.parse err: no digest-resp found")
	}
	a.Username = internal.ExtractSIPParam("username=\"", a.Val)
	/*
		a.Params = make([]*Param, 0)
		parts := strings.Split(a.Val[pos+1:], ",")
		for i := range parts {
			a.Params = append(a.Params, getParam(strings.Replace(parts[i], "\"", "", -1)))
		}
		if a.GetParam("username") != nil {
			a.Username = a.GetParam("username").Val
		}
	*/
	return nil
}
