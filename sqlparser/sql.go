package sqlparser

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/sipcapture/homer-app/sqlparser/query"
	"github.com/sipcapture/homer-app/utils/logger"
)

// Parse takes a string representing a SQL query and parses it into a query.Query struct. It may fail.
func Parse(sqls string) (query.Query, error) {
	qs, err := ParseMany([]string{sqls})
	if len(qs) == 0 {
		return query.Query{}, err
	}
	return qs[0], err
}

// ParseMany takes a string slice representing many SQL queries and parses them into a query.Query struct slice.
// It may fail. If it fails, it will stop at the first failure.
func ParseMany(sqls []string) ([]query.Query, error) {
	qs := []query.Query{}
	for _, sql := range sqls {
		q, err := parse(sql)
		if err != nil {
			return qs, err
		}
		qs = append(qs, q)
	}
	return qs, nil
}

func parse(sql string) (query.Query, error) {
	return (&parser{0, strings.TrimSpace(sql), stepWhereField, query.Query{}, nil, ""}).parse()
}

type step int

const (
	stepWhereField step = iota
	stepWhereOperator
	stepWhereValue
	stepWhereAnd
)

type parser struct {
	i               int
	sql             string
	step            step
	query           query.Query
	err             error
	nextUpdateField string
}

func (p *parser) parse() (query.Query, error) {
	q, err := p.doParse()
	p.err = err
	if p.err == nil {
		p.err = p.validate()
	}
	p.logError()
	return q, p.err
}

func (p *parser) doParse() (query.Query, error) {
	for {
		if p.i >= len(p.sql) {
			return p.query, p.err
		}
		switch p.step {
		case stepWhereField:
			identifier := p.peek()
			if !isIdentifier(identifier) {
				if isOpenOrClose(identifier) {
					p.pop()
					continue
				}
				return p.query, fmt.Errorf("at WHERE: expected field")
			}
			p.query.Conditions = append(p.query.Conditions, query.Condition{Operand1: identifier, Operand1IsField: true})
			p.pop()
			p.step = stepWhereOperator
		case stepWhereOperator:
			operator := p.peek()
			currentCondition := p.query.Conditions[len(p.query.Conditions)-1]
			switch operator {
			case "=":
				currentCondition.Operator = query.Eq
			case ">":
				currentCondition.Operator = query.Gt
			case ">=":
				currentCondition.Operator = query.Gte
			case "<":
				currentCondition.Operator = query.Lt
			case "<=":
				currentCondition.Operator = query.Lte
			case "!=":
				currentCondition.Operator = query.Ne
			case "LIKE":
				currentCondition.Operator = query.Like
			default:
				return p.query, fmt.Errorf("at WHERE: unknown operator")
			}
			p.query.Conditions[len(p.query.Conditions)-1] = currentCondition
			p.pop()
			p.step = stepWhereValue
		case stepWhereValue:
			currentCondition := p.query.Conditions[len(p.query.Conditions)-1]
			identifier := p.peek()
			if isIdentifier(identifier) {
				currentCondition.Operand2 = identifier
				currentCondition.Operand2IsField = true
			} else {
				quotedValue, ln := p.peekQuotedStringWithLength()
				if ln == 0 {
					//return p.query, fmt.Errorf("at WHERE: expected quoted value")
					currentCondition.Operand2 = identifier
					currentCondition.Operand2IsField = true
				} else {
					currentCondition.Operand2 = quotedValue
					currentCondition.Operand2IsField = false
				}
			}
			p.query.Conditions[len(p.query.Conditions)-1] = currentCondition
			p.pop()
			p.step = stepWhereAnd
		case stepWhereAnd:
			andRWord := p.peek()
			if strings.ToUpper(andRWord) != "AND" && strings.ToUpper(andRWord) != "OR" {

				if isOpenOrClose(andRWord) {
					p.pop()
					continue
				}
				return p.query, fmt.Errorf("expected AND or OR")
			}

			currentCondition := p.query.Conditions[len(p.query.Conditions)-1]
			currentCondition.Logical = strings.ToUpper(andRWord)
			p.query.Conditions[len(p.query.Conditions)-1] = currentCondition

			p.pop()
			p.step = stepWhereField
		}
	}
}

func (p *parser) peek() string {
	peeked, _ := p.peekWithLength()
	return peeked
}

func (p *parser) pop() string {
	peeked, len := p.peekWithLength()
	p.i += len
	p.popWhitespace()
	return peeked
}

func (p *parser) popWhitespace() {
	for ; p.i < len(p.sql) && p.sql[p.i] == ' '; p.i++ {
	}
}

var reservedWords = []string{
	"(", ")", ">=", "<=", "!=", ",", "=", ">", "<", "SELECT", "INSERT INTO", "VALUES", "UPDATE", "DELETE FROM",
	"WHERE", "FROM", "SET", "AS",
}

func (p *parser) peekWithLength() (string, int) {
	if p.i >= len(p.sql) {
		return "", 0
	}
	for _, rWord := range reservedWords {
		token := strings.ToUpper(p.sql[p.i:min(len(p.sql), p.i+len(rWord))])
		if token == rWord {
			return token, len(token)
		}
	}
	if p.sql[p.i] == '\'' { // Quoted string
		return p.peekQuotedStringWithLength()
	}
	return p.peekIdentifierWithLength()
}

func (p *parser) peekQuotedStringWithLength() (string, int) {
	if len(p.sql) < p.i || p.sql[p.i] != '\'' {
		return "", 0
	}
	for i := p.i + 1; i < len(p.sql); i++ {
		if p.sql[i] == '\'' && p.sql[i-1] != '\\' {
			return p.sql[p.i+1 : i], len(p.sql[p.i+1:i]) + 2 // +2 for the two quotes
		}
	}
	return "", 0
}

func (p *parser) peekIdentifierWithLength() (string, int) {
	for i := p.i; i < len(p.sql); i++ {
		if matched, _ := regexp.MatchString(`[[a-zA-Z0-9%_*@\+'><:\\\[\]\?\{\}\(\)~.\-\!\$]`, string(p.sql[i])); !matched {
			return p.sql[p.i:i], len(p.sql[p.i:i])
		}
	}
	return p.sql[p.i:], len(p.sql[p.i:])
}

func (p *parser) validate() error {

	for _, c := range p.query.Conditions {
		if c.Operator == query.UnknownOperator {
			return fmt.Errorf("at WHERE: condition without operator")
		}
		if c.Operand1 == "" && c.Operand1IsField {
			return fmt.Errorf("at WHERE: condition with empty left side operand")
		}
		if c.Operand2 == "" && c.Operand2IsField {
			return fmt.Errorf("at WHERE: condition with empty right side operand")
		}
	}

	return nil
}

func (p *parser) logError() {
	if p.err == nil {
		return
	}
	logger.Error("SQL PARSER: ", p.sql)
	logger.Error("SQL PARSER: ", (strings.Repeat(" ", p.i) + "^"))
	logger.Error("SQL PARSER: ", p.err)
}

func isIdentifier(s string) bool {
	for _, rw := range reservedWords {
		if strings.ToUpper(s) == rw {
			return false
		}
	}
	matched, _ := regexp.MatchString("[a-zA-Z_][a-zA-Z_0-9]*", s)
	return matched
}

func isIdentifierOrAsterisk(s string) bool {
	return isIdentifier(s) || s == "*"
}

func isOpenOrClose(s string) bool {
	return s == "(" || s == ")"
}
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
