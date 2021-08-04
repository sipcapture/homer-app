// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

import (
	"errors"
	"fmt"
	"strings"
)

const (
	sipParseStateStartLine = "SipParseStateStartLine"
	sipParseStateBody      = "SipMsgStateBody"
	sipParseStateHeaders   = "SipMsgStateHeaders"
	CR                     = "\r"
	LF                     = "\n"
	CALLING_PARTY_DEFAULT  = "default"
	CALLING_PARTY_RPID     = "rpid"
	CALLING_PARTY_PAID     = "paid"
)

type CallingPartyInfo struct {
	Name      string
	Number    string
	Anonymous bool
}

type Header struct {
	Header string
	Val    string
}

func (h *Header) String() string {
	return fmt.Sprintf("%s: %s", h.Header, h.Val)
}

type sipParserStateFn func(s *SipMsg) sipParserStateFn

type SipMsg struct {
	State            string
	Error            error
	Msg              string
	Body             string
	AuthVal          string
	AuthUser         string
	ContentLength    string
	ContentType      string
	From             string
	FromUser         string
	FromHost         string
	FromTag          string
	MaxForwards      string
	Organization     string
	To               string
	ToUser           string
	ToHost           string
	ToTag            string
	Expires          string
	Contact          string
	ContactVal       string
	ContactUser      string
	ContactHost      string
	ContactPort      int
	CallID           string
	XCallID          string
	XHeader          []string
	CHeader          []string
	CustomHeader     map[string]string
	Cseq             string
	CseqMethod       string
	CseqVal          string
	ReasonVal        string
	RTPStatVal       string
	ViaOne           string
	ViaOneBranch     string
	Privacy          string
	RemotePartyIdVal string
	DiversionVal     string
	PAssertedIdVal   string
	PaiUser          string
	PaiHost          string
	UserAgent        string
	Server           string
	URIHost          string
	URIRaw           string
	URIUser          string
	FirstMethod      string
	FirstResp        string
	Type             string
	FirstRespText    string
	eof              int
	hdr              string
	hdrv             string
	//Via                []*Via
	//StartLine          *StartLine
	//Headers            []*Header
	//Accept             *Accept
	//AlertInfo          string
	//Allow              []string
	//AllowEvents        []string
	//ContentDisposition *ContentDisposition
	//ContentLengthInt   int
	//MaxForwardsInt     int
	//ProxyAuthenticate  *Authorization
	//ProxyRequire       []string
	//Rack               *Rack
	//Rseq               string
	//RseqInt            int
	//RecordRoute        []*URI
	//RTPStat            *RTPStat
	//Route              []*URI
	//Require            []string
	//Unsupported        []string
	//Subject            string
	//Supported          []string
	//Warning            *Warning
	//WWWAuthenticate    *Authorization
}

func (s *SipMsg) run() {
	for state := parseSip; state != nil; {
		state = state(s)
	}
}

func (s *SipMsg) addError(err string) sipParserStateFn {
	s.Error = errors.New(err)
	return nil
}

func (s *SipMsg) addErrorNoReturn(err string) {
	s.Error = errors.New(err)
}

func (s *SipMsg) addHdr(str string) {
	if str == "" || str == " " {
		return
	}
	sp := strings.IndexRune(str, ':')
	if sp == -1 {
		return
	}

	//s.hdr = strings.ToLower(strings.TrimSpace(str[0:sp]))
	s.hdr = cleanWs(str[0:sp])

	if len(str)-1 >= sp+1 {
		s.hdrv = cleanWs(str[sp+1:])
	} else {
		// No header value
		s.hdrv = ""
	}

	if len(s.hdr) == 1 {
		switch {
		case s.hdr == "I" || s.hdr == "i":
			s.CallID = s.hdrv
		case s.hdr == "F" || s.hdr == "f":
			s.parseFrom(s.hdrv)
		case s.hdr == "T" || s.hdr == "t":
			s.parseTo(s.hdrv)
		case s.hdr == "C" || s.hdr == "c":
			s.ContentType = s.hdrv
		case s.hdr == "L" || s.hdr == "l":
			s.ContentLength = s.hdrv
		}
	} else if len(s.hdr) == 2 {
		// To header
		s.parseTo(s.hdrv)
	} else {
		switch {
		case s.hdr == "From" || s.hdr == "FROM" || s.hdr == "from":
			s.parseFrom(s.hdrv)
		case s.hdr == "Call-ID" || s.hdr == "CALL-ID" || s.hdr == "Call-Id" || s.hdr == "Call-id" || s.hdr == "call-id":
			s.CallID = s.hdrv
		case s.hdr == "CSeq" || s.hdr == "CSEQ" || s.hdr == "Cseq" || s.hdr == "cseq":
			s.CseqVal = s.hdrv
		case s.hdr == "User-Agent" || s.hdr == "USER-AGENT" || s.hdr == "user-agent":
			s.UserAgent = s.hdrv
		case s.hdr == "Server" || s.hdr == "server":
			s.Server = s.hdrv
		case s.hdr == "Content-Type" || s.hdr == "CONTENT-TYPE" || s.hdr == "content-type":
			s.ContentType = s.hdrv
		case s.hdr == "Content-Length" || s.hdr == "CONTENT-LENGTH" || s.hdr == "content-length":
			s.ContentLength = s.hdrv
		case s.hdr == "X-RTP-Stat":
			s.parseRTPStat(s.hdrv)
		}
	}
}

func GetSIPHeaderVal(header string, data string) (val string) {
	l := len(header)
	if startPos := strings.Index(data, header); startPos > -1 {
		restData := data[startPos:]
		if endPos := strings.Index(restData, "\r\n"); endPos > l {
			val = restData[l:endPos]
			i := 0
			for i < len(val) && (val[i] == ' ' || val[i] == '\t') {
				i++
			}
			return val[i:]
		}
	}
	return ""
}

/* func (s *SipMsg) parseAccept(str string) {
	s.Accept = &Accept{Val: str}
	s.Accept.parse()
} */

/* func (s *SipMsg) parseAllow(str string) {
	s.Allow = getCommaSeperated(str)
	if s.Allow == nil {
		s.Allow = []string{str}
	}
} */

/* func (s *SipMsg) parseAllowEvents(str string) {
	s.AllowEvents = getCommaSeperated(str)
	if s.AllowEvents == nil {
		s.Allow = []string{str}
	}
} */

/* func (s *SipMsg) parseContentDisposition(str string) {
	s.ContentDisposition = &ContentDisposition{Val: str}
	s.ContentDisposition.parse()
} */

func (s *SipMsg) parseFrom(str string) {
	s.From = str
	/*
		if s.From.Error == nil {
			s.FromUser = s.From.URI.User
			s.FromHost = s.From.URI.Host
			s.FromTag = s.From.Tag
		} else {
			s.Error = s.From.Error
		}
	*/
}

/* func (s *SipMsg) parseProxyAuthenticate(str string) {
	s.ProxyAuthenticate = &Authorization{Val: str}
	s.Error = s.ProxyAuthenticate.parse()
} */

/* func (s *SipMsg) parseRack(str string) {
	s.Rack = &Rack{Val: str}
	s.Error = s.Rack.parse()
} */

func (s *SipMsg) parseRTPStat(str string) {
	s.RTPStatVal = str
}

/* func (s *SipMsg) parseRecordRoute(str string) {
	cs := []string{str}
	for rt := range cs {
		left := 0
		right := 0
		for i := range cs[rt] {
			if cs[rt][i] == '<' && left == 0 {
				left = i
			}
			if cs[rt][i] == '>' && right == 0 {
				right = i
			}
		}
		if left < right {
			u := ParseURI(cs[rt][left+1 : right])
			if u.Error != nil {
				s.Error = fmt.Errorf("parseRecordRoute err: received err parsing uri: %v", u.Error)
				return
			}
			if s.RecordRoute == nil {
				s.RecordRoute = []*URI{u}
			}
			s.RecordRoute = append(s.RecordRoute, u)
		}
	}
	return
} */

/* func (s *SipMsg) parseRequire(str string) {
	s.Require = getCommaSeperated(str)
	if s.Require == nil {
		s.Require = []string{str}
	}
} */

/* func (s *SipMsg) parseRoute(str string) {
	cs := getCommaSeperated(str)
	for rt := range cs {
		left := 0
		right := 0
		for i := range cs[rt] {
			if cs[rt][i] == '<' && left == 0 {
				left = i
			}
			if cs[rt][i] == '>' && right == 0 {
				right = i
			}
		}
		if left < right {
			u := ParseURI(cs[rt][left+1 : right])
			if u.Error != nil {
				s.Error = fmt.Errorf("parseRoute err: received err parsing uri: %v", u.Error)
				return
			}
			if s.Route == nil {
				s.Route = []*URI{u}
			}
			s.Route = append(s.Route, u)
		}
	}
} */

func (s *SipMsg) parseStartLine(str string) {
	s.State = sipParseStateStartLine
	sLine := ParseStartLine(str)
	s.FirstMethod = sLine.Method
	s.FirstResp = sLine.Resp
	s.Type = sLine.Type
	s.FirstRespText = sLine.RespText
	if sLine.URI != nil {
		s.URIHost = sLine.URI.Host
		s.URIRaw = sLine.URI.Raw
		s.URIUser = sLine.URI.User
	}
	if sLine.Error != nil {
		s.Error = fmt.Errorf("parseStartLine err: received err while parsing start line: %v", sLine.Error)
	}
}

/* func (s *SipMsg) parseSupported(str string) {
	s.Supported = getCommaSeperated(str)
	if s.Supported == nil {
		s.Supported = []string{str}
	}
} */

func (s *SipMsg) parseTo(str string) {
	s.To = str
	/*
		if s.To.Error == nil {
			s.ToUser = s.To.URI.User
			s.ToHost = s.To.URI.Host
			s.ToTag = s.To.Tag
		} else {
			s.Error = s.To.Error
		}
	*/
}

/* func (s *SipMsg) parseWarning(str string) {
	s.Warning = &Warning{Val: str}
	s.Error = s.Warning.parse()
} */

/* func (s *SipMsg) parseWWWAuthenticate(str string) {
	s.WWWAuthenticate = &Authorization{Val: str}
	s.Error = s.WWWAuthenticate.parse()
} */

func getHeaders(s *SipMsg) sipParserStateFn {
	s.State = sipParseStateHeaders
	var hdr string
	msgLen := len(s.Msg)

	for curPos, crlfPos := 0, 0; curPos < s.eof+2 && s.eof+2 <= msgLen; curPos += 2 {
		crlfPos = strings.Index(s.Msg[curPos:s.eof+2], "\n")
		if crlfPos > 0 && curPos+crlfPos < msgLen {
			if strings.HasSuffix(s.Msg[curPos:curPos+crlfPos], "\r") {
				crlfPos--
				hdr = s.Msg[curPos : curPos+crlfPos]
			} else {
				hdr = s.Msg[curPos : curPos+crlfPos]
				crlfPos--
			}
		}

		hdr = cleanWs(hdr)
		if curPos == 0 {
			s.parseStartLine(hdr)
		} else {
			s.addHdr(hdr)
		}
		if s.Error != nil {
			return nil
		}
		curPos += crlfPos
	}
	return nil
}

func getBody(s *SipMsg) sipParserStateFn {
	s.State = sipParseStateBody
	if len(s.Msg)-1 > s.eof+4 {
		s.Body = s.Msg[s.eof+4:]
	}
	return getHeaders
}

func ParseMsg(str string) (s *SipMsg) {
	headersEnd := strings.Index(str, "\r\n\r\n")
	if headersEnd == -1 {
		headersEnd = strings.LastIndex(str, "\r\n")
	}
	s = &SipMsg{Msg: str, eof: headersEnd}
	if s.eof == -1 {
		s.Error = errors.New("ParseMsg: err parsing msg no SIP eof found")
		return s
	}
	s.run()
	return s
}

func parseSip(s *SipMsg) sipParserStateFn {
	if s.Error != nil {
		return nil
	}
	return getBody
}
