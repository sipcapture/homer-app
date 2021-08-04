// Copyright 2011, Shelby Ramsey. All rights reserved.
// Copyright 2018, Eugen Biegler. All rights reserved.
// Use of this code is governed by a BSD license that can be
// found in the LICENSE.txt file.

package sipparser

// Imports from the go standard library
import (
	"fmt"
	"strconv"
	"strings"
)

type Warning struct {
	Val     string
	Code    string
	CodeInt int
	Agent   string
	Text    string
}

func (w *Warning) parse() error {
	parts := strings.SplitN(w.Val, " ", 3)
	if got, want := len(parts), 3; got != want {
		return fmt.Errorf("Warning.parse err: split on LWS returned %d fields, want %d", got, want)
	}
	c, err := strconv.Atoi(parts[0])
	if err != nil || c < 0 || c > 999 {
		return fmt.Errorf("Warning.parse err: got code %q, want 3-digit code", parts[0])
	}
	w.Code = parts[0]
	w.CodeInt = c
	w.Agent = parts[1]
	w.Text = strings.Replace(parts[2], "\"", "", -1)
	return nil
}
