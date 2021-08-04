// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"fmt"

	"github.com/sipcapture/homer-app/utils/sipparser/internal"
)

type parseFromStateFn func(f *From) parseFromStateFn

// From holds a parsed header that has a format like:
// "NAME" <sip:user@hostinfo>;param=val
// and is used for the parsing of the from, to, and
// contact header in the parser program
// From holds the following public fields:
// -- Error is an error
// -- Val is the raw value
// -- Name is the name value
// -- Tag is the tag value
// -- URI is a parsed uri
// -- Params are for any generic params that are part of
//    the header
type From struct {
	Error error
	Val   string
	Name  string
	Tag   string
	URI   *URI
	//Params     []*Param
	endName    int
	rightBrack int
	leftBrack  int
	brackChk   bool
}

func (f *From) parse() {
	for state := parseFromState; state != nil; {
		state = state(f)
	}
}

/*
func (f *From) addParam(s string) {
	p := getParam(s)
	switch {
	case p.Param == "tag":
		f.Tag = p.Val
	default:
		if f.Params == nil {
			f.Params = make([]*Param, 0)
		}
		f.Params = append(f.Params, p)
	}
}
*/

func parseFromState(f *From) parseFromStateFn {
	if f.Error != nil {
		return nil
	}
	f.Name, f.endName = getName(f.Val)
	return parseFromGetURI
}

func parseFromGetURI(f *From) parseFromStateFn {
	f.leftBrack, f.rightBrack, f.brackChk = getBracks(f.Val)
	if f.brackChk == false {
		f.URI = ParseURI(f.Val)
		if f.URI.Error != nil {
			f.Error = fmt.Errorf("parseFromGetURI err: rcvd err parsing uri: %v", f.URI.Error)
			return nil
		}
		/*
			if f.URI.UriParams != nil {
				for i := range f.URI.UriParams {
					if f.URI.UriParams[i].Param == "tag" {
						f.Tag = f.URI.UriParams[i].Val
					}
				}
			}
		*/
		return nil
	}
	if f.brackChk == true {
		f.URI = ParseURI(f.Val[f.leftBrack+1 : f.rightBrack])
		if f.URI.Error != nil {
			f.Error = fmt.Errorf("parseFromGetURI err: rcvd err parsing uri: %v", f.URI.Error)
			return nil
		}
		return parseFromGetParams
	}
	return nil
}

func parseFromGetParams(f *From) parseFromStateFn {
	/*
		if f.brackChk == true && len(f.Val) > f.rightBrack+1 {
			pms := strings.Split(f.Val[f.rightBrack+1:], ";")
			for i := range pms {
				f.addParam(pms[i])
			}
			return nil
		}
	*/
	return nil
}

func getFrom(s string) *From {
	f := &From{Val: s}
	f.Tag = internal.ExtractSIPParam("tag=", s)
	f.parse()
	return f
}
