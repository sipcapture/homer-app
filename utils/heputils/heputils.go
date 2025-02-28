package heputils

import (
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"hash/fnv"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/manifoldco/promptui"
	uuid "github.com/satori/go.uuid"
	"github.com/sipcapture/homer-app/utils/logger"
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
    /__/\  /:/\:\     _____     
    \  \:\/:/__\/    |___  |    
     \  \::/            / /   
      \  \:\           / /             
       \  \:\         /_/               
        \__\/         

`

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

// import  checkFloatValue
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

// import  checkFloatValue
func CheckBoolValue(val interface{}) bool {
	if val != nil {
		myType := reflect.TypeOf(val)
		switch myType.Kind() {
		case reflect.Bool:
			return val.(bool)
		case reflect.Float64:
			if val.(float64) == 0 {
				return false
			} else {
				return true
			}
		default:
			return false
		}
	}
	return false
}

// import  checkFloatValue
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

type CaseInsensitiveReplacer struct {
	toReplace   *regexp.Regexp
	replaceWith string
}

func NewCaseInsensitiveReplacer(toReplace, replaceWith string) *CaseInsensitiveReplacer {
	return &CaseInsensitiveReplacer{
		toReplace:   regexp.MustCompile("(?i)" + toReplace),
		replaceWith: replaceWith,
	}
}

func (cir *CaseInsensitiveReplacer) Replace(str string) string {
	return cir.toReplace.ReplaceAllString(str, cir.replaceWith)
}

// import  checkFloatValue
func RemoveSqlInjection(val string) string {

	injStr := []string{"exec", "insert", "select", "delete", "update", "count", "alter", "chr", "mid", "master", "truncate", "char", "declare", ";", "-", "+", "|"}

	for _, sqlBad := range injStr {

		r := NewCaseInsensitiveReplacer(sqlBad, "")
		val = r.Replace(val)
	}

	return val
}

// import  checkFloatValue
func CheckSQLValue(val string) string {

	return strings.NewReplacer(
		`"`, `\"`,
		`&`, "&amp;",
	).Replace(val)

	return val
}

// import YesNo
func YesNo(table string) bool {
	prompt := promptui.Select{
		Label: "Force to populate table [" + table + "]  [Yes/No]",
		Items: []string{"Yes", "No"},
	}
	_, result, err := prompt.Run()
	if err != nil {
		log.Fatalf("Prompt failed %v\n", err)
	}
	return result == "Yes"
}

/* colorize message */
func Colorize(color Color, message string) {
	fmt.Println(string(color), message, string(ColorReset))
}

func Sanitize(text string) string {

	if strings.HasPrefix(text, "!=") {
		text = strings.TrimPrefix(text, "!=")
	}

	return strings.NewReplacer(
		`'`, "&#39;",
		`\"`, `\"`,
		`&`, "&amp;",
	).Replace(text)
}

func SanitizeTextArray(valArray []string) []string {

	for key, val := range valArray {
		valArray[key] = Sanitize(val)
	}

	return valArray
}

func SanitizeIntArray(valArray []string) []int {

	var intArray = []int{}
	for key, val := range valArray {
		intArray[key] = CheckIntValue(val)
	}
	return intArray
}

// import  convertPayloadTypeToString
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

// import  convertProtoTypeToString
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
	p1 := strings.Index(strings.ToLower(s), "content-type: application/isup")
	if p1 == -1 {
		return s
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

/* check if the element exists */
func ElementRealExists(arr []string, elem string) bool {

	if len(arr) == 0 {
		return false
	}

	if len(arr) == 1 && arr[0] == "" {
		return false
	}

	for index := range arr {
		if arr[index] == elem {
			return true
		}
	}
	return false
}

func GenerateToken() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]rune, 80)
	for i := range b {
		b[i] = letters[r.Intn(len(letters))]
	}
	return string(b)
}

// fileExists checks if a file exists and is not a directory before we
// try using it to prevent further errors.
func FileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

// make a hash
func Hash32(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
}

// make a genCodeChallengeS256
func GenCodeChallengeS256(s string) string {

	/*
		hash := hmac.New(sha256.New, []byte(s))
		hex.EncodeToString(hash.Sum(nil))
		return base64.StdEncoding.EncodeToString(hash.Sum(nil))
	*/
	hasher := sha256.New()
	hasher.Write([]byte(s))
	codeChallenge := base64.RawURLEncoding.EncodeToString(hasher.Sum(nil))
	return codeChallenge
}

func GenereateNewUUID() string {

	localUUID, err := uuid.NewV4()
	if err != nil {
		logger.Error(fmt.Sprintf("Error during generating new UUID: %s", err))
		return ""
	}

	return localUUID.String()
}

func GetSQLEqualityOperator(isLike bool) string {
	if isLike {
		return "LIKE"
	}
	return "="
}

func ApplyPrefixIndexHtml(prefix, root string) error {

	indexHtml := filepath.Join(root, "index.html")

	// Check if file exists in the rootpath of dist
	if FileExists(indexHtml) {

		// Create the content with the configured prefix
		if prefix != "" && !strings.HasSuffix(prefix, "/") {
			prefix = prefix + "/"
		}

		// Read the file content
		content, err := os.ReadFile(indexHtml)
		if err != nil {
			return fmt.Errorf("error reading file: %w", err)
		}

		// Convert to string for easier manipulation
		htmlContent := string(content)

		// Try different patterns to find and replace the PREFIX configuration

		// Pattern 1: Complete window.GLOBAL_CONFIG with PREFIX assignment
		re1 := regexp.MustCompile(`window\.GLOBAL_CONFIG\s*=\s*\{\s*PREFIX:\s*"[^"]*"\s*\};`)
		newConfig := fmt.Sprintf(`window.GLOBAL_CONFIG={PREFIX:"%s"};`, prefix)

		// Pattern 2: Just the PREFIX property
		re2 := regexp.MustCompile(`PREFIX:\s*"[^"]*"`)
		prefixValue := fmt.Sprintf(`PREFIX: "%s"`, prefix)

		// Pattern 3: Commented PREFIX line
		re3 := regexp.MustCompile(`//\s*PREFIX:\s*"[^"]*"`)
		uncommentedPrefix := fmt.Sprintf(`PREFIX: "%s"`, prefix)

		// Pattern 4: Empty GLOBAL_CONFIG
		re4 := regexp.MustCompile(`window\.GLOBAL_CONFIG\s*=\s*\{\s*\};`)
		configWithPrefix := fmt.Sprintf(`window.GLOBAL_CONFIG={PREFIX:"%s"};`, prefix)

		// Pattern 5: GLOBAL_CONFIG with commented PREFIX
		re5 := regexp.MustCompile(`window\.GLOBAL_CONFIG\s*=\s*\{\s*//\s*PREFIX:\s*"[^"]*"\s*\};`)
		configWithUncommentedPrefix := fmt.Sprintf(`window.GLOBAL_CONFIG={PREFIX:"%s"};`, prefix)

		// Try each pattern in sequence
		updatedContent := htmlContent

		if re1.MatchString(htmlContent) {
			updatedContent = re1.ReplaceAllString(htmlContent, newConfig)
		} else if re5.MatchString(htmlContent) {
			// Replace GLOBAL_CONFIG with commented PREFIX
			updatedContent = re5.ReplaceAllString(htmlContent, configWithUncommentedPrefix)
		} else if re4.MatchString(htmlContent) {
			// Replace empty GLOBAL_CONFIG
			updatedContent = re4.ReplaceAllString(htmlContent, configWithPrefix)
		} else if re3.MatchString(htmlContent) {
			// Replace commented PREFIX
			updatedContent = re3.ReplaceAllString(htmlContent, uncommentedPrefix)
		} else if re2.MatchString(htmlContent) {
			// Replace PREFIX property
			updatedContent = re2.ReplaceAllString(htmlContent, prefixValue)
		}

		// Check if a replacement was made
		if htmlContent == updatedContent {
			return fmt.Errorf("failed to match any PREFIX pattern in file %s", indexHtml)
		}

		// Write the updated content back to file
		err = os.WriteFile(indexHtml, []byte(updatedContent), 0644)
		if err != nil {
			return fmt.Errorf("error writing file: %w", err)
		}

		return nil

	}

	return nil
}
