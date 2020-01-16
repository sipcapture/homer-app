package heputils

import (
	"fmt"
	"reflect"
	"strings"
)

type Color string

const (
	ColorBlack  Color = "\u001b[30m"
	ColorRed          = "\u001b[31m"
	ColorGreen        = "\u001b[32m"
	ColorYellow       = "\u001b[33m"
	ColorBlue         = "\u001b[34m"
	ColorReset        = "\u001b[0m"
)

//import  checkFloatValue
func CheckFloatValue(val interface{}) float64 {
	if val != nil {
		myType := reflect.TypeOf(val)
		switch myType.Kind() {
		case reflect.Int:
			return float64(val.(int))
		case reflect.Float64:
			return val.(float64)
		default:
			return float64(0)
		}
	}
	return float64(0)
}

/* colorize message */
func Colorize(color Color, message string) {
	fmt.Println(string(color), message, string(ColorReset))
}

//import  convertPayloadTypeToString
func ConvertPayloadTypeToString(val float64) (string, string) {

	var Method, Text string

	switch val {
	case 81:
		Method = "CDR"
		Text = "CDR"
		break
	case 100:
		Method = "LOG"
		Text = "LOG"
		break
	case 5:
		Method = "RTCP"
		Text = "RTCP"
		break
	case 34:
		Method = "Report RTP"
		Text = "Report RTP"
		break
	case 35:
		Method = "Report RTP"
		Text = "Report RTP"
		break
	case 200:
		Method = "Loki Data"
		Text = "Loki Data"
		break
	case 54:
		Method = "ISUP"
		Text = "ISUP message"
		break
	default:
		Method = "Generic"
		Text = "generic"
		break
	}

	return Method, Text
}

//import  convertProtoTypeToString
func ConvertProtoTypeToString(val float64) string {

	var protoText string

	switch val {
	case 6:
		protoText = "TCP"
		break
	case 17:
		protoText = "UDP"
		break
	case 132:
		protoText = "SCTP"
		break
	default:
		protoText = "UDP"
		break
	}

	return protoText
}

/* isup to HEX */
func IsupToHex(s string) string {
	p1 := strings.Index(s, "/isup")
	if p1 == -1 {
		if p1 = strings.Index(s, "/ISUP"); p1 == -1 {
			return s
		}
	}

	if p2 := strings.Index(s[p1:], "\r\n\r\n"); p2 > -1 {
		p2 = p1 + p2 + 4
		if p3 := strings.Index(s[p2:], "\r\n"); p3 > -1 {
			p3 = p2 + p3
			return injectHex(s, p2, p3)
		} else {
			return injectHex(s, p2, len(s)-1)
		}
	}
	return s
}

func injectHex(s string, start, end int) string {
	return s[:start] + fmt.Sprintf("% X", s[start:end]) + s[end+1:]
}
