// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"errors"
	"fmt"
	"strings"
)

const (
	// SIP request or response
	SIP_REQUEST  = "REQUEST"
	SIP_RESPONSE = "RESPONSE"
	// SIP Methods
	SIP_METHOD_INVITE    = "INVITE"
	SIP_METHOD_ACK       = "ACK"
	SIP_METHOD_OPTIONS   = "OPTIONS"
	SIP_METHOD_BYE       = "BYE"
	SIP_METHOD_CANCEL    = "CANCEL"
	SIP_METHOD_REGISTER  = "REGISTER"
	SIP_METHOD_INFO      = "INFO"
	SIP_METHOD_PRACK     = "PRACK"
	SIP_METHOD_SUBSCRIBE = "SUBSCRIBE"
	SIP_METHOD_NOTIFY    = "NOTIFY"
	SIP_METHOD_UPDATE    = "UPDATE"
	SIP_METHOD_MESSAGE   = "MESSAGE"
	SIP_METHOD_REFER     = "REFER"
	SIP_METHOD_PUBLISH   = "PUBLISH"
	// SIP Headers
	SIP_HDR_CALL_ID              = "call-id"
	SIP_HDR_CALL_ID_CMP          = "i"
	SIP_HDR_CONTACT              = "contact"
	SIP_HDR_CONTACT_CMP          = "m"
	SIP_HDR_CONTENT_DISPOSITION  = "content-disposition"
	SIP_HDR_CONTENT_ENCODING     = "content-encoding"
	SIP_HDR_CONTENT_ENCODING_CMP = "e"
	SIP_HDR_CONTENT_LANGUAGE     = "content-language"
	SIP_HDR_CONTENT_LENGTH       = "content-length"
	SIP_HDR_CONTENT_LENGTH_CMP   = "l"
	SIP_HDR_CONTENT_TYPE         = "content-type"
	SIP_HDR_CONTENT_TYPE_CMP     = "c"
	SIP_HDR_CSEQ                 = "cseq"
	SIP_HDR_FROM                 = "from"
	SIP_HDR_FROM_CMP             = "f"
	SIP_HDR_TO                   = "to"         // RFC3261
	SIP_HDR_TO_CMP               = "t"          // RFC3261
	SIP_HDR_USER_AGENT           = "user-agent" // RFC3261
	SIP_HDR_X_RTP_STAT           = "x-rtp-stat"
	SIP_HDR_X_RTP_STAT_ADD       = "x-rtp-stat-add"
)

/*
var (
	SIP_METHODS = []string{
		SIP_METHOD_INVITE,
		SIP_METHOD_ACK,
		SIP_METHOD_OPTIONS,
		SIP_METHOD_BYE,
		SIP_METHOD_CANCEL,
		SIP_METHOD_REGISTER,
		SIP_METHOD_INFO,
		SIP_METHOD_PRACK,
		SIP_METHOD_SUBSCRIBE,
		SIP_METHOD_NOTIFY,
		SIP_METHOD_UPDATE,
		SIP_METHOD_MESSAGE,
		SIP_METHOD_REFER,
		SIP_METHOD_PUBLISH,
	}
)
*/

type parseStartLineStateFn func(s *StartLine) parseStartLineStateFn

type StartLine struct {
	Error    error
	Val      string
	Type     string
	Method   string
	URI      *URI
	Resp     string
	RespText string
	Proto    string
	Version  string
}

func (s *StartLine) run() {
	for state := parseStartLine; state != nil; {
		state = state(s)
	}
}

func parseStartLine(s *StartLine) parseStartLineStateFn {
	if s.Error != nil {
		return nil
	}
	if len(s.Val) < 3 {
		s.Error = errors.New("parseStartLine err: length of s.Val is less than 3. Invalid start line")
		return nil
	}
	if s.Val[0:3] == "SIP" {
		s.Type = SIP_RESPONSE
		return parseStartLineResponse
	}
	s.Type = SIP_REQUEST
	return parseStartLineRequest
}

func parseStartLineResponse(s *StartLine) parseStartLineStateFn {
	parts := strings.SplitN(s.Val, " ", 3)
	if len(parts) != 3 {
		s.Error = errors.New("parseStartLineRespone err: err getting parts from LWS")
		return nil
	}
	charPos := strings.IndexRune(parts[0], '/')
	if charPos == -1 {
		s.Error = errors.New("parseStartLineRespone err: err getting proto char")
		return nil
	}
	s.Proto = parts[0][0:charPos]
	if len(parts[0])-1 < charPos+1 {
		s.Error = errors.New("parseStartLineResponse err: proto char appears to be at end of proto")
		return nil
	}
	s.Version = parts[0][charPos+1:]
	s.Resp = parts[1]
	s.RespText = parts[2]
	return nil
}

func parseStartLineRequest(s *StartLine) parseStartLineStateFn {
	parts := strings.SplitN(s.Val, " ", 3)
	if len(parts) != 3 {
		s.Error = errors.New("parseStartLineRequest err: request line did not split on LWS correctly")
		return nil
	} else if len(parts[1]) == 0 {
		s.Error = errors.New("parseStartLineRequest err: empty request uri part")
		return nil
	}
	s.Method = parts[0]
	s.URI = ParseURI(parts[1])
	if s.URI.Error != nil {
		s.Error = fmt.Errorf("parseStartLineRequest err: err in URI: %v", s.URI.Error)
		return nil
	}
	charPos := strings.IndexRune(parts[2], '/')
	if charPos == -1 {
		s.Error = errors.New("parseStartLineRequest err: could not get \"/\" pos in parts[2]")
		return nil
	}
	if len(parts[2])-1 < charPos+1 {
		s.Error = errors.New("parseStartLineRequest err: \"/\" char appears to be at end of line")
		return nil
	}
	s.Proto = parts[2][0:charPos]
	s.Version = parts[2][charPos+1:]
	return nil
}

func ParseStartLine(str string) *StartLine {
	s := &StartLine{Val: str}
	s.run()
	return s
}
