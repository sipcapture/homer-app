package heputils

import (
	"fmt"
	"reflect"
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
