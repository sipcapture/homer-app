package heputils

import (
	"fmt"
	"math/rand"
	"reflect"
	"strconv"
	"strings"
	"time"
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

var HomerLogo = `
         ___              
        /__/\             
        \  \:\           
         \__\:\  
     ___ /  /::\     
    /__/\  /:/\:\     _____ _____    
    \  \:\/:/__\/    |___  |___  |   
     \  \::/            / /   / / 
      \  \:\           / /   / /          
       \  \:\         /_(_) /_/               
        \__\/         

`

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

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

//import  checkFloatValue
func CheckIntValue(val interface{}) int {
	if val != nil {
		myType := reflect.TypeOf(val)
		switch myType.Kind() {
		case reflect.String:
			tmp, _ := strconv.Atoi(val.(string))
			return tmp
		case reflect.Int:
			return val.(int)
		case reflect.Float64:
			return int(val.(float64))
		default:
			return int(0)
		}
	}
	return int(0)
}

/* colorize message */
func Colorize(color Color, message string) {
	fmt.Println(string(color), message, string(ColorReset))
}

func Sanitize(text string) string {
	return strings.NewReplacer(
		`'`, "&#39;",
		`\"`, `\"`,
		`&`, "&amp;",
	).Replace(text)
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

/* check if the element exists */
func ItemExists(arr []string, elem string) bool {

	for index := range arr {
		if arr[index] == elem {
			return true
		}
	}
	return false
}

/* check if the element exists */
func ElementExists(arr []string, elem string) bool {

	if len(arr) == 0 {
		return true
	}

	for index := range arr {
		if strings.EqualFold(arr[index], elem) {
			return true
		}
	}
	return false
}

func GenerateToken() string {

	rand.Seed(time.Now().UnixNano())
	b := make([]rune, 80)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
