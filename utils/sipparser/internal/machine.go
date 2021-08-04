
//line machine.rl:1
package internal

import (
  "strings"
)

// ragel -G2 -Z machine.rl


//line machine.go:13
const metric_start int = 2
const metric_first_final int = 2
const metric_error int = 0

const metric_en_main int = 2


//line machine.rl:12


func ExtractSIPParam(param, data string) (s string) {
  if numPos := strings.Index(data, param); numPos >= 0 {
      numPos += len(param)
      data = data[numPos:]
  } else {
      return s
  }

  cs, p, pe, eof := 0, 0, len(data), len(data)
  mark := 0

  
//line machine.go:36
	{
	cs = metric_start
	}

//line machine.go:41
	{
	if p == pe {
		goto _test_eof
	}
	switch cs {
	case 2:
		goto st_case_2
	case 3:
		goto st_case_3
	case 4:
		goto st_case_4
	case 0:
		goto st_case_0
	case 1:
		goto st_case_1
	}
	goto st_out
	st_case_2:
		switch data[p] {
		case 13:
			goto tr3
		case 32:
			goto tr3
		case 34:
			goto tr4
		case 59:
			goto tr3
		}
		if 9 <= data[p] && data[p] <= 10 {
			goto tr3
		}
		goto tr2
tr2:
//line machine.rl:26

		  mark = p
		
	goto st3
	st3:
		if p++; p == pe {
			goto _test_eof3
		}
	st_case_3:
//line machine.go:85
		switch data[p] {
		case 13:
			goto tr6
		case 32:
			goto tr6
		case 34:
			goto tr7
		case 59:
			goto tr6
		}
		if 9 <= data[p] && data[p] <= 10 {
			goto tr6
		}
		goto st3
tr0:
//line machine.rl:37
 return s 
	goto st4
tr3:
//line machine.rl:26

		  mark = p
		
//line machine.rl:30

		  s = data[mark:p]
		
//line machine.rl:37
 return s 
	goto st4
tr6:
//line machine.rl:30

		  s = data[mark:p]
		
//line machine.rl:37
 return s 
	goto st4
	st4:
		if p++; p == pe {
			goto _test_eof4
		}
	st_case_4:
//line machine.go:129
		goto st0
st_case_0:
	st0:
		cs = 0
		goto _out
tr4:
//line machine.rl:26

		  mark = p
		
//line machine.rl:30

		  s = data[mark:p]
		
	goto st1
tr7:
//line machine.rl:30

		  s = data[mark:p]
		
	goto st1
	st1:
		if p++; p == pe {
			goto _test_eof1
		}
	st_case_1:
//line machine.go:156
		if data[p] == 44 {
			goto tr0
		}
		goto st0
	st_out:
	_test_eof3: cs = 3; goto _test_eof
	_test_eof4: cs = 4; goto _test_eof
	_test_eof1: cs = 1; goto _test_eof

	_test_eof: {}
	if p == eof {
		switch cs {
		case 3:
//line machine.rl:30

		  s = data[mark:p]
		
		case 2:
//line machine.rl:26

		  mark = p
		
//line machine.rl:30

		  s = data[mark:p]
		
//line machine.go:183
		}
	}

	_out: {}
	}

//line machine.rl:41


	return s
}