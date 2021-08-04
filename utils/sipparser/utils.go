// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from go standard library
import (
	"strings"
)

func cleanWs(s string) string {
	if s == "" {
		return s
	}
PREFIXWS:
	if len(s) > 0 {
		if s[0] == ' ' || s[0] == '\t' {
			s = s[1:]
			goto PREFIXWS
		}
	}

SUFFIXWS:
	if len(s) > 0 {
		if s[len(s)-1] == ' ' || s[len(s)-1] == '\t' {
			s = s[0 : len(s)-1]
			goto SUFFIXWS
		}
	}
	return s
}

func cleanBrack(s string) string {
	if s == "" {
		return ""
	}
	sLen := len(s)
	var n string
	switch {
	case sLen > 0 && s[0] == '<':
		n = s[1:]
	default:
		n = s
	}
	for i := range n {
		if n[i] == '>' {
			if len(n)-1 > i+1 {
				if n[i+1] == ';' {
					n = n[0:i] + n[i+1:]
					return n
				}
			}
			if i == len(n)-1 {
				n = n[0:i]
				return n
			}
		}
	}
	return n
}

func getQuoteChars(s string) (one int, two int, chk bool) {
	ct := 0
	for i := range s {
		if s[i] == '"' {
			switch {
			case ct == 0:
				one = i
				ct = 1
			case ct == 1:
				two = i
				return one, two, true
			default:
				return one, two, false
			}
		}
	}
	return 0, 0, false
}

func getBracks(s string) (one int, two int, chk bool) {
	one = strings.IndexRune(s, '<')
	if one == -1 {
		return 0, 0, false
	}
	two = strings.IndexRune(s, '>')
	if two == -1 {
		return 0, 0, false
	}
	if two < one {
		return 0, 0, false
	}
	return one, two, true
}

func getName(s string) (name string, end int) {
	if s == "" {
		return "", 0
	}
	posOne, posTwo, chk := getQuoteChars(s)
	if chk == true {
		if len(s)-1 > posTwo {
			return cleanWs(s[posOne+1 : posTwo]), posTwo
		}
		return "", 0
	}
	posOne = strings.IndexRune(s, '<')
	if posOne == -1 {
		return "", 0
	}
	if posOne == 0 {
		return "", 0
	}
	return cleanWs(s[0:posOne]), posOne
}

func getCommaSeperated(str string) []string {
	s := strings.Split(str, ",")
	if len(s) == 1 {
		return nil
	}
	for i := range s {
		s[i] = cleanWs(s[i])
	}
	return s
}
