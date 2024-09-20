package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"os/exec"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/Jeffail/gabs/v2"
	"github.com/dop251/goja"
	"github.com/jinzhu/gorm"
	"github.com/shomali11/util/xconditions"
	"github.com/sipcapture/homer-app/config"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/sqlparser"
	"github.com/sipcapture/homer-app/sqlparser/query"
	"github.com/sipcapture/homer-app/utils/exportwriter"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sipcapture/homer-app/utils/logger"
	"github.com/sipcapture/homer-app/utils/logger/function"
	"github.com/sipcapture/homer-app/utils/sipparser"
)

//search Service
type SearchService struct {
	ServiceData
}

//external decoder
type ExternalDecoder struct {
	Binary    string   `json:"binary"`
	Param     string   `json:"param"`
	Protocols []string `json:"protocols"`
	UID       uint32   `json:"uid"`
	GID       uint32   `json:"gid"`
	Active    bool     `json:"active"`
}

func executeJSInputFunction(jsString string, callIds []interface{}) []interface{} {

	vm := goja.New()

	//jsString := "var returnData=[]; for (var i = 0; i < data.length; i++) { returnData.push(data[i]+'_b2b-1'); }; returnData;"
	// "input_function_js": "var returnData=[]; for (var i = 0; i < data.length; i++) { returnData.push(data[i]+'_b2b-1'); }; returnData;"

	logger.Debug("Inside JS script: Callids: ", callIds)
	logger.Debug("Script: ", jsString)

	vm.Set("scriptPrintf", ScriptPrintf)
	vm.Set("data", callIds)

	v, err := vm.RunString(jsString)
	if err != nil {
		logger.Error("Javascript Script error:", err)
		return nil
	}

	data := v.Export().([]interface{})

	logger.Debug("Inside JS output data: ", data)

	return data
}

func ScriptPrintf(val interface{}) {

	logger.Debug("script:", val)
}

func executeJSOutputFunction(jsString string, dataRow []model.HepTable) []model.HepTable {

	vm := goja.New()

	//logger.Debug("Inside JS script: Callids: ", dataRow)
	logger.Debug("Script: ", jsString)
	vm.Set("scriptPrintf", ScriptPrintf)
	marshalData, _ := json.Marshal(dataRow)
	sData, _ := gabs.ParseJSON(marshalData)
	vm.Set("data", sData.Data())

	v, err := vm.RunString(jsString)
	if err != nil {
		logger.Error("Javascript Script error:", err)
		return nil
	}

	returnData := []model.HepTable{}

	data := v.Export().([]interface{})

	marshalData, _ = json.Marshal(data)

	err = json.Unmarshal(marshalData, &returnData)
	if err != nil {
		logger.Error("Couldnt unmarshal:", err)
		return nil
	}

	return returnData
}

const (
	// enum
	FIRST  = 1
	VALUE  = 2
	EQUALS = 3
	END    = 4
	RESET  = 10
)

func buildQuery(elems []interface{}, orLogic bool, mappingJSON json.RawMessage, element int) (sql string, sLimit int, dataValueArray []interface{}) {
	sLimit = 200

	smartMap := make(map[string]model.MappingSmart)

	firsLoop := true

	for k, v := range elems {
		mapData := v.(map[string]interface{})
		if formVal, ok := mapData["value"]; ok {
			formValue := ""
			formName := mapData["name"].(string)
			formType := mapData["type"].(string)

			//We should be sure  that this is value string
			switch x := formVal.(type) {
			case string:
				formValue = formVal.(string)
			default:
				logger.Error("Unsupported type:", x, ", Value: ", formVal, "Name:", formName, ", Type: ", formType, "MAPDATA: ", mapData)
				continue
			}

			if formName == "smartinput" {

				/* Map fields */
				sMapping, _ := gabs.ParseJSON(mappingJSON)
				for _, val := range sMapping.Children() {

					if val.Exists("id") && val.Exists("type") {

						result := model.MappingSmart{}
						key := val.S("id").Data().(string)

						result.Value = val.S("id").Data().(string)
						result.Type = val.S("type").Data().(string)
						smartMap[key] = result
					}
				}

				switch x := formVal.(type) {
				case string:
					formValue = formVal.(string)
				default:
					logger.Error("Unsupported type:", x)
				}

				queryA, err := sqlparser.Parse(formValue)
				if err != nil {
					logger.Error("BAD Query type:", err.Error())
				}

				counterParentClose := 0

				for _, vCond := range queryA.Conditions {

					operandField := vCond.Operand1
					operandValue := vCond.Operand2
					operator := query.OperatorString[vCond.Operator]
					logicalElement := vCond.Logical
					typeValue := "string"

					if modSmart, ok := smartMap[operandField]; ok {
						operandField = modSmart.Value
						typeValue = modSmart.Type
					}

					if strings.Contains(operandField, ".") {
						elemArray := strings.Split(operandField, ".")
						if typeValue == "integer" {
							sql += fmt.Sprintf("(%s->>'%s')::int %s ? ", elemArray[0], elemArray[1], operator)
							dataValueArray = append(dataValueArray, heputils.CheckIntValue(operandValue))

						} else {
							if strings.Contains(operandValue, "%") {
								operator = "LIKE"
							}
							sql += fmt.Sprintf("%s->>'%s' %s ? ", elemArray[0], elemArray[1], operator)
							dataValueArray = append(dataValueArray, operandValue)

						}
					} else if typeValue == "integer" || typeValue == "number" {
						sql += fmt.Sprintf("%s %s ?", operandField, operator)
						dataValueArray = append(dataValueArray, heputils.CheckIntValue(operandValue))

					} else {
						if operandValue == "isEmpty" {
							sql += fmt.Sprintf("%s %s ''", operandField, operator)
						} else if operandValue == "isNull" && operandField == "=" {
							sql += fmt.Sprintf("%s is NULL", operandField)
						} else {
							if strings.Contains(operandValue, "%") {
								operator = "LIKE"
							}
							sql += fmt.Sprintf("%s %s ?", operandField, operator)
							dataValueArray = append(dataValueArray, operandValue)
						}
					}

					if logicalElement != "" {
						sql = sql + " " + logicalElement + " "
						if logicalElement == "OR" {
							counterParentClose++
							sql = sql + "("
						}
					}
				}

				//we close it
				if counterParentClose > 0 {
					sql = sql + strings.Repeat(")", counterParentClose)
				}

				// make query inside
				//if sql != "" {
				//	sql = " AND " + sql
				//}

				logger.Debug("NEW SQL: ", sql)

				continue
			}

			notStr := ""
			equalStr := "="
			operator := " AND "

			if orLogic {
				operator = " OR "
			}

			if firsLoop && element == 0 {
				operator = ""
				firsLoop = false
			}

			if strings.HasPrefix(formValue, "||") {
				formValue = strings.TrimPrefix(formValue, "||")
				if k > 0 {
					operator = " OR "
				}
			}
			if strings.HasPrefix(formValue, "!=") {
				notStr = " NOT "
				equalStr = " <> "
			}
			if formName == "limit" {
				sLimit = heputils.CheckIntValue(formValue)
				continue
			} else if formName == "raw" {
				sql = sql + operator + formName + notStr + " ILIKE '" + heputils.Sanitize(formValue) + "'"
				continue
			}

			var valueArray []string
			if strings.Contains(formValue, ";") {
				valueArray = strings.Split(formValue, ";")
			} else {
				valueArray = []string{formValue}
			}
			valueArray = heputils.SanitizeTextArray(valueArray)

			// data_header or protocal_header values
			if strings.Contains(formName, ".") {
				elemArray := strings.Split(formName, ".")
				if formType == "integer" {
					sql = sql + operator + fmt.Sprintf("(%s->>'%s')::int %s ?", elemArray[0], elemArray[1], equalStr)
					dataValueArray = append(dataValueArray, heputils.CheckIntValue(formValue))

					continue
				}
				if strings.Contains(formValue, "%") && strings.Contains(formValue, ";") {
					sql = sql + operator + fmt.Sprintf("%s->>'%s' %sLIKE ANY ('{?}')", elemArray[0], elemArray[1], notStr)
					dataValueArray = append(dataValueArray, heputils.Sanitize(formValue))
					sql = strings.Replace(sql, ";", ",", -1)
				} else if strings.Contains(formValue, "%") {
					sql = sql + operator + fmt.Sprintf("%s->>'%s' %sLIKE ?", elemArray[0], elemArray[1], notStr)
					dataValueArray = append(dataValueArray, heputils.Sanitize(formValue))
				} else if strings.Contains(formValue, ",") || len(valueArray) > 1 {
					sql = sql + operator + fmt.Sprintf("%s->>'%s' %sIN (?%s)", elemArray[0], elemArray[1], notStr, strings.Repeat(",?", len(valueArray)-1))
					for _, vaString := range valueArray {
						dataValueArray = append(dataValueArray, vaString)
					}
				} else {

					if len(valueArray) == 1 {
						if valueArray[0] == "isEmpty" {
							sql = sql + operator + fmt.Sprintf("%s->>'%s' %s ''", elemArray[0], elemArray[1], equalStr)
						} else if valueArray[0] == "isNull" && equalStr == "=" {
							sql = sql + operator + fmt.Sprintf("%s->>'%s' is NULL", elemArray[0], elemArray[1])
						} else {
							sql = sql + operator + fmt.Sprintf("%s->>'%s'%s ?%s", elemArray[0], elemArray[1], equalStr, strings.Repeat(",?", len(valueArray)-1))
							for _, vaString := range valueArray {
								dataValueArray = append(dataValueArray, vaString)
							}
						}
					} else {
						sql = sql + operator + fmt.Sprintf("%s->>'%s'%s ?%s", elemArray[0], elemArray[1], equalStr, strings.Repeat(",?", len(valueArray)-1))
						for _, vaString := range valueArray {
							dataValueArray = append(dataValueArray, vaString)
						}
					}
				}
				continue
			}

			if formType == "integer" {
				sql = sql + operator + fmt.Sprintf("%s%s ?", formName, equalStr)
				dataValueArray = append(dataValueArray, heputils.CheckIntValue(formValue))

				continue
			}

			if strings.Contains(formValue, "%") {
				sql = sql + operator + formName + notStr + " LIKE ?"
				dataValueArray = append(dataValueArray, heputils.Sanitize(formValue))

			} else {
				sql = sql + operator + fmt.Sprintf("%s %sIN (?%s)", formName, notStr, strings.Repeat(",?", len(valueArray)-1))
				for _, vaString := range valueArray {
					dataValueArray = append(dataValueArray, vaString)
				}
			}
		}
	}

	// make query inside
	if sql != "" {
		sql = " AND ( " + sql + " )"
	}

	return sql, sLimit, dataValueArray
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) SearchData(searchObject *model.SearchObject, aliasData map[string]string,
	userGroup string, mapsFieldsData map[string]json.RawMessage) (string, error) {
	table := "hep_proto_1_default"
	searchData := []model.HepTable{}
	searchFromTime := time.Unix(searchObject.Timestamp.From/int64(time.Microsecond), 0)
	searchToTime := time.Unix(searchObject.Timestamp.To/int64(time.Microsecond), 0)
	Data, _ := json.Marshal(searchObject.Param.Search)
	sData, _ := gabs.ParseJSON(Data)
	sql := "create_date between ? AND ?"
	dataArrayExtraValues := []interface{}{}
	dataArrayValues := []interface{}{}

	logger.Debug("ISOLATEGROUP ", config.Setting.MAIN_SETTINGS.IsolateGroup)
	logger.Debug("USERGROUP ", userGroup)

	if config.Setting.MAIN_SETTINGS.IsolateGroup != "" && config.Setting.MAIN_SETTINGS.IsolateGroup == userGroup {
		sql = sql + " AND " + config.Setting.MAIN_SETTINGS.IsolateQuery
	}

	var sLimit int
	dataArrayValues = append(dataArrayValues, searchFromTime)
	dataArrayValues = append(dataArrayValues, searchToTime)

	for key, _ := range sData.ChildrenMap() {
		table = "hep_proto_" + key
		if sData.Exists(key) {
			elems := sData.Search(key).Data().([]interface{})
			mappingJSON := mapsFieldsData[key]
			s, l, dArray := buildQuery(elems, searchObject.Param.OrLogic, mappingJSON, len(dataArrayExtraValues))
			dataArrayExtraValues = append(dataArrayExtraValues, dArray...)
			sql += s
			sLimit = l
		}
	}

	dataArrayValues = append(dataArrayValues, dataArrayExtraValues...)

	//var searchData
	for session := range ss.Session {
		searchTmp := []model.HepTable{}

		/* if node doesnt exists - continue */
		if !heputils.ElementExists(searchObject.Param.Location.Node, session) {
			continue
		}

		ss.Session[session].Debug().
			Table(table).
			Where(sql, dataArrayValues...).
			Limit(sLimit).
			Find(&searchTmp)

		if len(searchTmp) > 0 {
			for val := range searchTmp {
				searchTmp[val].Node = session
				searchTmp[val].DBNode = session
			}

			searchData = append(searchData, searchTmp...)
		}
	}

	/* lets sort it */
	sort.Slice(searchData, func(i, j int) bool {
		return searchData[i].CreatedDate.Before(searchData[j].CreatedDate)
	})

	rows, _ := json.Marshal(searchData)
	data, _ := gabs.ParseJSON(rows)
	dataReply := gabs.Wrap([]interface{}{})
	for _, value := range data.Children() {
		alias := gabs.New()
		dataElement := gabs.New()
		for k, v := range value.ChildrenMap() {
			switch k {
			case "data_header":
				if v.Exists("node") {
					v.DeleteP("node")
				}
				/*
					for a, r := range v.ChildrenMap() {
						if a == "node" {
							continue
						}
						newData := gabs.New()
						newData.Set(r.Data().(interface{}), a)
						dataElement.Merge(newData)
					}*/

				dataElement.Merge(v)

			case "protocol_header":
				dataElement.Merge(v)
			case "id", "sid", "node", "dbnode":
				newData := gabs.New()
				newData.Set(v.Data().(interface{}), k)
				dataElement.Merge(newData)

			case "raw":
				if table == "hep_proto_100_default" {
					newData := gabs.New()
					newData.Set(v.Data().(interface{}), k)
					dataElement.Merge(newData)
				}
			}
		}

		srcPort, dstPort := "0", "0"

		if dataElement.Exists("srcPort") {
			srcPort = strconv.FormatFloat(dataElement.S("srcPort").Data().(float64), 'f', 0, 64)
		}

		if dataElement.Exists("dstPort") {
			dstPort = strconv.FormatFloat(dataElement.S("dstPort").Data().(float64), 'f', 0, 64)
		}

		srcIP := dataElement.S("srcIp").Data().(string)
		dstIP := dataElement.S("dstIp").Data().(string)

		srcIPPort := srcIP + ":" + srcPort
		dstIPPort := dstIP + ":" + dstPort
		srcIPPortZero := srcIP + ":" + "0"
		dstIPPortZero := dstIP + ":" + "0"

		testInput := net.ParseIP(srcIP)
		if testInput.To4() == nil && testInput.To16() != nil {
			srcIPPort = "[" + srcIP + "]:" + srcPort
			srcIPPortZero = "[" + srcIP + "]:" + "0"
		}

		testInput = net.ParseIP(dstIP)
		if testInput.To4() == nil && testInput.To16() != nil {
			dstIPPort = "[" + dstIP + "]:" + dstPort
			dstIPPortZero = "[" + dstIP + "]:" + "0"

		}

		//add capture ID
		if config.Setting.MAIN_SETTINGS.UseCaptureIDInAlias && dataElement.Exists("captureId") {

			captureID := dataElement.S("captureId").Data().(string)

			if value, ok := aliasData[srcIPPort+":"+captureID]; ok {
				alias.Set(value, srcIPPort)
			} else if value, ok := aliasData[srcIPPortZero+":"+captureID]; ok {
				alias.Set(value, srcIPPort)
			}

			if value, ok := aliasData[dstIPPort+":"+captureID]; ok {
				alias.Set(value, dstIPPort)
			} else if value, ok := aliasData[dstIPPortZero+":"+captureID]; ok {
				alias.Set(value, dstIPPort)
			}
		}

		if !alias.Exists(srcIPPort) {

			if value, ok := aliasData[srcIPPort]; ok {
				alias.Set(value, srcIPPort)
			} else if value, ok := aliasData[srcIPPortZero]; ok {
				alias.Set(value, srcIPPort)
			}
		}

		if !alias.Exists(dstIPPort) {

			if value, ok := aliasData[dstIPPort]; ok {
				alias.Set(value, dstIPPort)
			} else if value, ok := aliasData[dstIPPortZero]; ok {
				alias.Set(value, dstIPPort)
			}
		}

		if !alias.Exists(srcIPPort) {
			alias.Set(srcIPPort, srcIPPort)
		}

		if !alias.Exists(dstIPPort) {
			alias.Set(dstIPPort, dstIPPort)
		}

		dataElement.Set(alias.Search(srcIPPort).Data(), "aliasSrc")
		dataElement.Set(alias.Search(dstIPPort).Data(), "aliasDst")
		dataElement.Set(table, "table")

		createDate := int64(dataElement.S("timeSeconds").Data().(float64)*1000000 + dataElement.S("timeUseconds").Data().(float64))

		dataElement.Set(createDate/1000, "create_date")
		if err := dataReply.ArrayAppend(dataElement.Data()); err != nil {
			logger.Error("Bad assigned array")
		}

		//back compatible
		if dataElement.Exists("id") && !dataElement.Exists("uuid") {
			myId := int64(dataElement.S("id").Data().(float64))
			dataElement.Set(myId, "uuid")
		}
	}

	dataKeys := gabs.Wrap([]interface{}{})
	for _, v := range dataReply.Children() {
		for key := range v.ChildrenMap() {
			if !function.ArrayKeyExits(key, dataKeys) {
				dataKeys.ArrayAppend(key)
			}
		}
	}

	total, _ := dataReply.ArrayCount()

	reply := gabs.New()
	reply.Set(total, "total")
	reply.Set(dataReply.Data(), "data")
	reply.Set(dataKeys.Data(), "keys")

	return reply.String(), nil
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) GetDBNodeList(searchObject *model.SearchObject) (string, error) {

	reply := gabs.New()
	reply.Set(1, "total")
	reply.Set("", "data")

	return reply.String(), nil
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) GetDecodedMessageByID(searchObject *model.SearchObject) (string, error) {
	table := "hep_proto_1_default"
	sLimit := searchObject.Param.Limit
	searchData := []model.HepTable{}
	searchFromTime := time.Unix(searchObject.Timestamp.From/int64(time.Microsecond), 0)
	searchToTime := time.Unix(searchObject.Timestamp.To/int64(time.Microsecond), 0)
	Data, _ := json.Marshal(searchObject.Param.Search)
	sData, _ := gabs.ParseJSON(Data)
	sql := "create_date between ? and ?"
	var doDecode = false

	for key := range sData.ChildrenMap() {
		table = "hep_proto_" + key
		if sData.Exists(key) {

			var elems float64

			if !sData.Exists(key, "id") && !sData.Exists(key, "uuid") {
				return "", fmt.Errorf("no ID or UUID has been provided")
			}

			if sData.Exists(key, "id") {
				elems = sData.Search(key, "id").Data().(float64)
				sql = sql + " AND id = " + fmt.Sprintf("%d", int(elems))

			} else if sData.Exists(key, "uuid") {

				elems := sData.Search(key, "uuid").Data().([]interface{})
				keyData := []string{}
				for _, val := range elems {
					keyData = append(keyData, fmt.Sprintf("%v", val))
				}
				sql = sql + " AND " + fmt.Sprintf("%s IN (%s)", "id", strings.Join(keyData[:], ","))
			}

			/* check if we have to decode */
			if ss.Decoder.Active && heputils.ItemExists(ss.Decoder.Protocols, key) {
				doDecode = true
			}
		}
	}

	for session := range ss.Session {

		/* if node doesnt exists - continue */
		if !heputils.ElementExists(searchObject.Param.Location.Node, session) {
			continue
		}

		searchTmp := []model.HepTable{}
		ss.Session[session].Debug().
			Table(table).
			Where(sql, searchFromTime, searchToTime).
			Limit(sLimit).
			Find(&searchTmp)

		if len(searchTmp) > 0 {
			for val := range searchTmp {
				searchTmp[val].DBNode = session
				searchTmp[val].Node = session

			}
			searchData = append(searchData, searchTmp...)
		}
	}

	rows, _ := json.Marshal(searchData)
	data, _ := gabs.ParseJSON(rows)
	dataReply := gabs.Wrap([]interface{}{})
	for _, value := range data.Children() {
		dataElement := gabs.New()
		newData := gabs.New()
		for k := range value.ChildrenMap() {
			switch k {
			case "raw":
				/* doing sipIsup extraction */
				if doDecode {
					if decodedData, err := ss.excuteExternalDecoder(value); err == nil {
						newData.Set(decodedData, "decoded")
					}
				}
			}
		}
		dataElement.Merge(newData)
		dataReply.ArrayAppend(dataElement.Data())
	}
	dataKeys := gabs.Wrap([]interface{}{})
	for _, v := range dataReply.Children() {
		for key := range v.ChildrenMap() {
			if !function.ArrayKeyExits(key, dataKeys) {
				dataKeys.ArrayAppend(key)
			}
		}
	}

	total, _ := dataReply.ArrayCount()

	reply := gabs.New()
	reply.Set(total, "total")
	reply.Set(dataReply.Data(), "data")

	return reply.String(), nil
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) GetMessageByID(searchObject *model.SearchObject) (string, error) {
	table := "hep_proto_1_default"
	sLimit := searchObject.Param.Limit
	searchData := []model.HepTable{}
	searchFromTime := time.Unix(searchObject.Timestamp.From/int64(time.Microsecond), 0)
	searchToTime := time.Unix(searchObject.Timestamp.To/int64(time.Microsecond), 0)
	Data, _ := json.Marshal(searchObject.Param.Search)
	sData, _ := gabs.ParseJSON(Data)
	sql := "create_date between ? and ?"
	var sipExist = false

	for key := range sData.ChildrenMap() {
		table = "hep_proto_" + key
		if sData.Exists(key) {
			if key == "1_call" {
				sipExist = true
			}

			var elems float64
			if !sData.Exists(key, "id") && !sData.Exists(key, "uuid") {
				return "", fmt.Errorf("no ID or UUID has been provided")
			}

			if sData.Exists(key, "id") {
				elems = sData.Search(key, "id").Data().(float64)
				sql = sql + " AND id = " + fmt.Sprintf("%d", int(elems))

			} else if sData.Exists(key, "uuid") {

				elems := sData.Search(key, "uuid").Data().([]interface{})
				keyData := []string{}
				for _, val := range elems {
					keyData = append(keyData, fmt.Sprintf("%v", val))
				}
				sql = sql + " AND " + fmt.Sprintf("%s IN (%s)", "id", strings.Join(keyData[:], ","))
			}
		}
	}

	for session := range ss.Session {
		/* if node doesnt exists - continue */
		if !heputils.ElementExists(searchObject.Param.Location.Node, session) {
			continue
		}

		searchTmp := []model.HepTable{}
		ss.Session[session].Debug().
			Table(table).
			Where(sql, searchFromTime, searchToTime).
			Limit(sLimit).
			Find(&searchTmp)

		if len(searchTmp) > 0 {
			for val := range searchTmp {
				searchTmp[val].Node = session
				searchTmp[val].DBNode = session

			}
			searchData = append(searchData, searchTmp...)
		}
	}

	rows, _ := json.Marshal(searchData)
	data, _ := gabs.ParseJSON(rows)
	dataReply := gabs.Wrap([]interface{}{})
	for _, value := range data.Children() {
		dataElement := gabs.New()
		for k, v := range value.ChildrenMap() {
			switch k {
			case "data_header", "protocol_header":
				dataElement.Merge(v)
			case "id", "sid":
				newData := gabs.New()
				newData.Set(v.Data().(interface{}), k)
				dataElement.Merge(newData)

			case "raw":
				newData := gabs.New()
				/* doing sipIsup extraction */
				if sipExist {
					rawElement := fmt.Sprintf("%v", v.Data().(interface{}))
					newData.Set(heputils.IsupToHex(rawElement), k)
				} else {
					newData.Set(v.Data().(interface{}), k)
				}

				dataElement.Merge(newData)
			}
		}

		if dataElement.Exists("timeSeconds") {
			createDate := int64(dataElement.S("timeSeconds").Data().(float64)*1000000 + dataElement.S("timeUseconds").Data().(float64))
			dataElement.Set(createDate/1000, "create_ts")
			dataElement.Set(createDate/1000, "micro_ts")
		}

		//make back compatible to hepic DB
		//back compatible
		if dataElement.Exists("id") && !dataElement.Exists("uuid") {
			myId := int64(dataElement.S("id").Data().(float64))
			dataElement.Set(myId, "uuid")
		}

		dataReply.ArrayAppend(dataElement.Data())
	}
	dataKeys := gabs.Wrap([]interface{}{})
	for _, v := range dataReply.Children() {
		for key := range v.ChildrenMap() {
			if !function.ArrayKeyExits(key, dataKeys) {
				dataKeys.ArrayAppend(key)
			}
		}
	}

	total, _ := dataReply.ArrayCount()

	reply := gabs.New()
	reply.Set(total, "total")
	reply.Set(dataReply.Data(), "data")
	reply.Set(dataKeys.Data(), "keys")

	return reply.String(), nil
}

//this method create new user in the database
//it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) excuteExternalDecoder(dataRecord *gabs.Container) (interface{}, error) {

	if ss.Decoder.Active {
		logger.Debug("Trying to debug using external decoder")
		logger.Debug(fmt.Sprintf("Decoder to [%s, %s, %v]\n", ss.Decoder.Binary, ss.Decoder.Param, ss.Decoder.Protocols))
		//cmd := exec.Command(ss.Decoder.Binary, ss.Decoder.Param)
		var buffer bytes.Buffer
		export := exportwriter.NewWriter(buffer)
		var rootExecute = false

		// pcap export
		if err := export.WritePcapHeader(65536, 1); err != nil {
			logger.Error("write error to the pcap header", err)
			return nil, err
		}

		if err := export.WriteDataPcapBuffer(dataRecord); err != nil {
			logger.Error("write error to the pcap buffer", err)
			return nil, err
		}

		cmd := exec.Command(ss.Decoder.Binary, "-Q", "-T", "json", "-l", "-i", "-", ss.Decoder.Param)

		/*check if we root under root - changing to an user */
		uid, gid := os.Getuid(), os.Getgid()

		if uid == 0 || gid == 0 {
			logger.Info("running under root/wheel: UID: [%d], GID: [%d] - [%d] - [%d]. Changing to user...", uid, gid, ss.Decoder.UID, ss.Decoder.GID)
			if ss.Decoder.UID != 0 && ss.Decoder.GID != 0 {
				logger.Info("Changing to: UID: [%d], GID: [%d]", uid, gid)
				cmd.SysProcAttr = &syscall.SysProcAttr{
					Credential: &syscall.Credential{
						Uid: ss.Decoder.UID, Gid: ss.Decoder.GID,
						NoSetGroups: true,
					},
				}
			} else {
				logger.Error("You run external decoder under root! Please set UID/GID in the config")
				rootExecute = true
			}
		}

		stdin, err := cmd.StdinPipe()
		if err != nil {
			logger.Error("Bad cmd stdin", err)
			return nil, err
		}
		go func() {
			defer stdin.Close()
			io.WriteString(stdin, export.Buffer.String())
			return
		}()

		out, err := cmd.CombinedOutput()
		if err != nil {
			logger.Error("Bad combined output: ", err)
			return nil, err
		}

		var skipElement = 0

		/* this is fix if you run the webapp under root */
		if rootExecute {
			/* limit search String */
			maxEl := len(out)
			if maxEl > 100 {
				maxEl = 100
			}
			for i := 0; i < maxEl; i++ {
				if string(out[i]) == "[" || string(out[i]) == "{" {
					skipElement = i
					break
				}
			}
		}

		sData, err := gabs.ParseJSON(out[skipElement:])
		if err != nil {
			logger.Error("bad json", err)
			return nil, err
		}

		return sData.Data(), nil
	}

	return nil, errors.New("decoder not active. You should not be here")
}

//this method create new user in the database
//it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) GetTransaction(table string, data []byte, correlationJSON []byte, doexp bool,
	aliasData map[string]string, typeReport int, nodes []string, settingService *UserSettingsService,
	userGroup string, whitelist []string) (string, error) {
	var dataWhere []interface{}
	requestData, _ := gabs.ParseJSON(data)
	for key, value := range requestData.Search("param", "search").ChildrenMap() {
		table = "hep_proto_" + key
		dataWhere = append(dataWhere, value.Search("callid").Data().([]interface{})...)
	}

	timeWhereFrom := requestData.S("timestamp", "from").Data().(float64)
	timeWhereTo := requestData.S("timestamp", "to").Data().(float64)
	timeFrom := time.Unix(int64(timeWhereFrom/float64(time.Microsecond)), 0).UTC()
	timeTo := time.Unix(int64(timeWhereTo/float64(time.Microsecond)), 0).UTC()

	dataRow, _ := ss.GetTransactionData(table, "sid", dataWhere, timeFrom, timeTo, nodes, userGroup, false, whitelist)
	marshalData, _ := json.Marshal(dataRow)

	jsonParsed, _ := gabs.ParseJSON(marshalData)
	correlation, _ := gabs.ParseJSON(correlationJSON)

	var dataSrcField = make(map[string][]interface{})

	if len(correlationJSON) > 0 {
		// S is shorthand for Search
		for _, child := range jsonParsed.Search().Children() {
			for _, corrChild := range correlation.Search().Children() {
				sf := corrChild.Search("source_field").Data().(string)
				nKey := make(map[string][]interface{})
				if strings.Contains(sf, ".") {
					elemArray := strings.Split(sf, ".")
					switch child.Search(elemArray[0], elemArray[1]).Data().(type) {
					case string:
						nKey[sf] = append(nKey[sf], child.Search(elemArray[0], elemArray[1]).Data().(string))
					case float64:
						nKey[sf] = append(nKey[sf], child.Search(elemArray[0], elemArray[1]).Data().(float64))
					}
				} else {
					nKey[sf] = append(nKey[sf], child.Search(sf).Data().(string))
				}
				if len(nKey) != 0 {
					for _, v := range nKey[sf] {
						if !function.KeyExits(v, dataSrcField[sf]) {
							dataSrcField[sf] = append(dataSrcField[sf], v)
						}
					}
				}
			}
		}
	}

	var foundCidData []string

	for _, corrs := range correlation.Children() {
		var from time.Time
		var to time.Time

		sourceField := corrs.Search("source_field").Data().(string)
		lookupID := corrs.Search("lookup_id").Data().(float64)
		lookupProfile := corrs.Search("lookup_profile").Data().(string)
		lookupField := corrs.Search("lookup_field").Data().(string)
		lookupRange := corrs.Search("lookup_range").Data().([]interface{})
		newWhereData := dataSrcField[sourceField]
		likeSearch := false

		if len(newWhereData) == 0 {
			continue
		}

		table := "hep_proto_" + strconv.FormatFloat(lookupID, 'f', 0, 64) + "_" + lookupProfile

		if len(lookupRange) > 0 {
			from = timeFrom.Add(time.Duration(lookupRange[0].(float64)) * time.Second).UTC()
			to = timeTo.Add(time.Duration(lookupRange[1].(float64)) * time.Second).UTC()
		}
		if lookupID == 0 {
			logger.Error("We need to implement remote call here")
		} else {
			if sourceField == "data_header.callid" {

				logger.Debug(lookupProfile)
				logger.Debug(lookupField)
			}

			if corrs.Exists("input_function_js") {
				inputFunction := corrs.Search("input_function_js").Data().(string)
				logger.Debug("Input function: ", inputFunction)
				newDataArray := executeJSInputFunction(inputFunction, newWhereData)
				logger.Debug("sid array before JS:", newWhereData)
				if newDataArray != nil {
					newWhereData = append(newWhereData, newDataArray...)
				}
			}

			if corrs.Exists("input_script") {
				inputScript := corrs.Search("input_script").Data().(string)
				logger.Debug("Input function: ", inputScript)
				dataScript, err := settingService.GetScriptByParam("scripts", inputScript)
				if err == nil {
					scriptNew, _ := strconv.Unquote(dataScript)
					logger.Debug("OUR script:", scriptNew)
					newDataArray := executeJSInputFunction(scriptNew, newWhereData)
					logger.Debug("sid array before JS:", newWhereData)
					if newDataArray != nil {
						newWhereData = append(newWhereData, newDataArray...)
						logger.Debug("sid array after JS:", newWhereData)
					}
				}
			}

			if len(foundCidData) > 0 {
				for _, v := range foundCidData {
					newWhereData = append(newWhereData, v)
				}
			}
			if corrs.Exists("like_search") && corrs.Search("like_search").Data().(bool) {
				likeSearch = true
			}

			newDataRow, _ := ss.GetTransactionData(table, lookupField, newWhereData, from, to, nodes, userGroup, likeSearch, whitelist)
			if corrs.Exists("append_sid") && corrs.Search("append_sid").Data().(bool) {
				marshalData, _ = json.Marshal(newDataRow)
				jsonParsed, _ = gabs.ParseJSON(marshalData)
				for _, value := range jsonParsed.Children() {
					elems := value.Search("sid").Data().(string)
					if !heputils.ItemExists(foundCidData, elems) {
						foundCidData = append(foundCidData, elems)
					}
				}
			}

			/* post_aggregation_field need to re-implement this function */
			/* https://github.com/sipcapture/homer-app/blob/nodejs/server/classes/searchdata.js#L630-L667 */
			/*
				if corrs.Exists("post_aggregation_field") {
					postAggreagtionField := corrs.Search("post_aggregation_field").Data().(string)
					if len(postAggreagtionField) > 0 {
						marshalData, _ = json.Marshal(newDataRow)
						jsonParsed, _ = gabs.ParseJSON(marshalData)
						for _, value := range jsonParsed.Children() {
							elems := value.Search(postAggreagtionField).Data().(string)
							if !heputils.ItemExists(foundCidData, elems) {
								foundCidData = append(foundCidData, elems)
							}
						}
					}
				}
			*/

			dataRow = append(dataRow, newDataRow...)
			logger.Debug("Correlation data len:", len(dataRow))

			if corrs.Exists("output_script") {
				outputScript := corrs.Search("output_script").Data().(string)
				logger.Debug("Output function: ", outputScript)
				dataScript, err := settingService.GetScriptByParam("scripts", outputScript)
				if err == nil {
					scriptNew, _ := strconv.Unquote(dataScript)
					logger.Debug("OUR script:", scriptNew)
					newDataRaw := executeJSOutputFunction(scriptNew, dataRow)
					//logger.Debug("sid array before JS:", newDataRaw)
					if newDataRaw != nil {
						dataRow = newDataRaw
						//logger.Debug("sid array after JS:", dataRow)
					}
				}
			}
		}
	}

	/* lets remove duplicates */
	dataRow = uniqueHepTable(dataRow)

	/* lets sort it */
	sort.Slice(dataRow, func(i, j int) bool {
		return dataRow[i].CreatedDate.Before(dataRow[j].CreatedDate)
	})

	marshalData, _ = json.Marshal(dataRow)
	jsonParsed, _ = gabs.ParseJSON(marshalData)

	if typeReport == 0 {
		reply := ss.getTransactionSummary(jsonParsed, aliasData)
		return reply, nil
	} else {

		var buffer bytes.Buffer
		export := exportwriter.NewWriter(buffer)

		// pcap export
		if typeReport == 1 {
			err := export.WritePcapHeader(65536, 1)
			if err != nil {
				logger.Error("write error to the pcap header", err)
			}
		}
		for _, h := range jsonParsed.Children() {

			if typeReport == 2 {
				err := export.WriteDataToBuffer(h)
				if err != nil {
					logger.Error("write error to the buffer", err)
				}
			} else if typeReport == 1 {
				err := export.WriteDataPcapBuffer(h)
				if err != nil {
					logger.Error("write error to the pcap buffer = ", err)
				}
			}
		}

		if typeReport == 1 {
			return export.Buffer.String(), nil
		}
		return export.Buffer.String(), nil
	}
}

func uniqueHepTable(hepSlice []model.HepTable) []model.HepTable {
	keys := make(map[string]bool)
	list := []model.HepTable{}
	for _, entry := range hepSlice {
		dataKey := strconv.Itoa(entry.Id) + ":" + entry.CreatedDate.String()
		if _, value := keys[dataKey]; !value {
			keys[dataKey] = true
			list = append(list, entry)
		}
	}

	if config.Setting.TRANSACTION_SETTINGS.GlobalDeduplicate {

		logger.Debug("Transaction size after first filter:", len(list))
		keys2 := make(map[string]string)
		list2 := []model.HepTable{}
		for _, entry := range list {
			var protocolHeader map[string]interface{}
			json.Unmarshal(entry.ProtocolHeader, &protocolHeader)
			dataKey := entry.Raw
			if value, exists := keys2[dataKey]; value == protocolHeader["captureId"].(string) || !exists {
				keys2[dataKey] = protocolHeader["captureId"].(string)
				list2 = append(list2, entry)
			}
		}
		logger.Debug("Transaction size after second filter:", len(list2))
		return list2
	} else {
		return list
	}
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) GetTransactionData(table string, fieldKey string, dataWhere []interface{}, timeFrom,
	timeTo time.Time, nodes []string, userGroup string, likeSearch bool, whitelist []string) ([]model.HepTable, error) {

	searchData := []model.HepTable{}
	query := "create_date between ? AND ? "

	if likeSearch {
		query += "AND " + fieldKey + " LIKE ANY(ARRAY[?])"
	} else {
		query += "AND " + fieldKey + " in (?)"
	}

	logger.Debug("ISOLATEGROUP ", config.Setting.MAIN_SETTINGS.IsolateGroup)
	logger.Debug("USERGROUP ", userGroup)

	if config.Setting.MAIN_SETTINGS.IsolateGroup != "" && config.Setting.MAIN_SETTINGS.IsolateGroup == userGroup {
		query = query + " AND " + config.Setting.MAIN_SETTINGS.IsolateQuery
	}

	for _, ip := range whitelist {
		query = query + fmt.Sprintf(" AND (protocol_header->>'srcIp' != '%s' AND protocol_header->>'dstIp' != '%s' ) ", ip, ip)
	}

	for session := range ss.Session {
		/* if node doesnt exists - continue */
		if !heputils.ElementExists(nodes, session) {
			continue
		}

		searchTmp := []model.HepTable{}
		if err := ss.Session[session].Debug().
			Table(table).
			Where(query, timeFrom.Format(time.RFC3339), timeTo.Format(time.RFC3339), dataWhere).
			Find(&searchTmp).Error; err != nil {
			logger.Error("GetTransactionData: We have got error: ", err)
		}

		logger.Debug("GetTransactionData: Len: ", len(searchTmp))

		if len(searchTmp) > 0 {

			profileName := strings.TrimPrefix(table, "hep_proto_")

			for val := range searchTmp {
				searchTmp[val].Node = session
				searchTmp[val].DBNode = session
				searchTmp[val].Profile = profileName
			}
			searchData = append(searchData, searchTmp...)
		}
	}

	//response, _ := json.Marshal(searchData)
	return searchData, nil
}

func (ss *SearchService) getTransactionSummary(data *gabs.Container, aliasData map[string]string) string {

	var position = 0
	sid := gabs.New()
	host := gabs.New()
	alias := gabs.New()
	dataKeys := gabs.Wrap([]interface{}{})

	callData := []model.CallElement{}
	dataReply := gabs.Wrap([]interface{}{})

	for _, value := range data.Children() {
		dataElement := gabs.New()

		for k, v := range value.ChildrenMap() {
			switch k {
			case "data_header", "protocol_header":
				dataElement.Merge(v)
			case "sid", "correlation_id":
				sidData := gabs.New()
				sidData.Set(v.Data().(interface{}), k)
				dataElement.Merge(sidData)
				sid.Set(v.Data().(interface{}), k)
			default:
				newData := gabs.New()
				newData.Set(v.Data().(interface{}), k)
				dataElement.Merge(newData)
			}
		}

		callElement := model.CallElement{
			ID:          0,
			Sid:         "12345",
			DstHost:     "127.0.0.1",
			SrcHost:     "127.0.0.1",
			DstID:       "127.0.0.1:5060",
			SrcID:       "127.0.0.1:5060",
			SrcIP:       "127.0.0.1",
			DstIP:       "127.0.0.2",
			SrcPort:     0,
			DstPort:     0,
			Method:      "Generic",
			MethodText:  "generic",
			CreateDate:  0,
			Protocol:    1,
			MsgColor:    "blue",
			RuriUser:    "",
			Destination: 0,
		}
		if dataElement.Exists("payloadType") {
			callElement.Method, callElement.MethodText = heputils.ConvertPayloadTypeToString(heputils.CheckFloatValue(dataElement.S("payloadType").Data()))
		}

		if !dataElement.Exists("srcIp") {
			dataElement.Set("127.0.0.1", "srcIp")
			dataElement.Set(0, "srcPort")
		}

		if !dataElement.Exists("dstIp") {
			dataElement.Set("127.0.0.2", "dstIp")
			dataElement.Set(0, "dstPort")
		}

		if dataElement.Exists("id") {
			callElement.ID = dataElement.S("id").Data().(float64)
		}
		if dataElement.Exists("srcIp") {
			callElement.SrcIP = dataElement.S("srcIp").Data().(string)
			callElement.SrcHost = dataElement.S("srcIp").Data().(string)
		}

		if dataElement.Exists("dstIp") {
			callElement.DstIP = dataElement.S("dstIp").Data().(string)
			callElement.DstHost = dataElement.S("dstIp").Data().(string)
		}
		if dataElement.Exists("srcPort") {
			callElement.SrcPort = heputils.CheckFloatValue(dataElement.S("srcPort").Data())
		}
		if dataElement.Exists("dstPort") {
			callElement.DstPort = heputils.CheckFloatValue(dataElement.S("dstPort").Data())
		}

		if dataElement.Exists("method") {
			callElement.Method = dataElement.S("method").Data().(string)
			callElement.MethodText = dataElement.S("method").Data().(string)
		}
		if dataElement.Exists("msg_name") {
			callElement.Method = dataElement.S("msg_name").Data().(string)
			callElement.MethodText = dataElement.S("msg_name").Data().(string)
		}
		if dataElement.Exists("event") {
			callElement.Method = dataElement.S("event").Data().(string)
			callElement.MethodText = dataElement.S("event").Data().(string)
		}
		if dataElement.Exists("create_date") {
			date, _ := dataElement.S("create_date").Data().(string)
			t, _ := time.Parse(time.RFC3339, date)
			callElement.CreateDate = t.Unix()
			callElement.MicroTs = t.Unix()
		}

		if dataElement.Exists("timeSeconds") && dataElement.Exists("timeUseconds") {
			ts := int64(heputils.CheckFloatValue(dataElement.S("timeSeconds").Data())*1000000 + heputils.CheckFloatValue(dataElement.S("timeUseconds").Data()))
			callElement.CreateDate = ts / 1000
			callElement.MicroTs = callElement.CreateDate
			dataElement.Set(callElement.MicroTs, "create_date")
			dataElement.Set(callElement.MicroTs, "create_ts")
			dataElement.Set(callElement.MicroTs, "micro_ts")

		}

		if dataElement.Exists("protocol") {
			callElement.Protocol = heputils.CheckFloatValue(dataElement.S("protocol").Data())
		}
		if dataElement.Exists("sid") {
			callElement.Sid = dataElement.S("sid").Data().(string)
		}

		if dataElement.Exists("raw") {

			callElement.RuriUser = dataElement.S("raw").Data().(string)
			lenMax := 50
			if len(callElement.RuriUser) < lenMax {
				lenMax = len(callElement.RuriUser)
			}
			callElement.RuriUser = callElement.RuriUser[:lenMax]

			if dataElement.Exists("payloadType") && dataElement.S("payloadType").Data().(float64) == 1 {

				str := dataElement.S("raw").Data().(string)

				x := []string{"From", "To"}

				sip := sipparser.ParseMsg(str, x, nil)

				if !dataElement.Exists("from_domain") && sip.FromHost != "" {
					dataElement.Set(sip.FromHost, "from_domain")
				}
				if !dataElement.Exists("to_domain") && sip.ToHost != "" {
					dataElement.Set(sip.FromHost, "to_domain")
				}
			}
		}

		callElement.SrcID = callElement.SrcHost + ":" + strconv.FormatFloat(callElement.SrcPort, 'f', 0, 64)
		callElement.DstID = callElement.DstHost + ":" + strconv.FormatFloat(callElement.DstPort, 'f', 0, 64)

		srcIPPort := callElement.SrcIP + ":" + strconv.FormatFloat(callElement.SrcPort, 'f', 0, 64)
		dstIPPort := callElement.DstIP + ":" + strconv.FormatFloat(callElement.DstPort, 'f', 0, 64)

		testInput := net.ParseIP(callElement.SrcHost)
		if testInput.To4() == nil && testInput.To16() != nil {
			srcIPPort = "[" + callElement.SrcIP + "]:" + strconv.FormatFloat(callElement.SrcPort, 'f', 0, 64)
			callElement.SrcID = "[" + callElement.SrcHost + "]:" + strconv.FormatFloat(callElement.SrcPort, 'f', 0, 64)

		}

		testInput = net.ParseIP(callElement.DstIP)
		if testInput.To4() == nil && testInput.To16() != nil {
			dstIPPort = "[" + callElement.DstIP + "]:" + strconv.FormatFloat(callElement.DstPort, 'f', 0, 64)
			callElement.DstID = "[" + callElement.DstHost + "]:" + strconv.FormatFloat(callElement.DstPort, 'f', 0, 64)
		}

		srcIPPortZero := callElement.SrcIP + ":" + strconv.Itoa(0)
		dstIPPortZero := callElement.DstIP + ":" + strconv.Itoa(0)

		//add capture ID
		if config.Setting.MAIN_SETTINGS.UseCaptureIDInAlias && dataElement.Exists("captureId") {

			captureID := dataElement.S("captureId").Data().(string)

			if value, ok := aliasData[srcIPPort+":"+captureID]; ok {
				alias.Set(value, srcIPPort)
			} else if value, ok := aliasData[srcIPPortZero+":"+captureID]; ok {
				alias.Set(value, srcIPPort)
			}

			if value, ok := aliasData[dstIPPort+":"+captureID]; ok {
				alias.Set(value, dstIPPort)
			} else if value, ok := aliasData[dstIPPortZero+":"+captureID]; ok {
				alias.Set(value, dstIPPort)
			}
		}

		if !alias.Exists(srcIPPort) {

			if value, ok := aliasData[srcIPPort]; ok {
				alias.Set(value, srcIPPort)
			} else if value, ok := aliasData[srcIPPortZero]; ok {
				alias.Set(value, srcIPPort)
			}
		}

		if !alias.Exists(dstIPPort) {

			if value, ok := aliasData[dstIPPort]; ok {
				alias.Set(value, dstIPPort)
			} else if value, ok := aliasData[dstIPPortZero]; ok {
				alias.Set(value, dstIPPort)
			}
		}

		if !alias.Exists(srcIPPort) {
			alias.Set(srcIPPort, srcIPPort)
		}

		if !alias.Exists(dstIPPort) {
			alias.Set(dstIPPort, dstIPPort)
		}

		callElement.AliasSrc = alias.Search(srcIPPort).Data().(string)
		callElement.AliasDst = alias.Search(dstIPPort).Data().(string)

		if !host.Exists(callElement.SrcID) {
			jsonObj := gabs.New()
			jsonObj.Array(callElement.SrcID, "host")
			jsonObj.ArrayAppend(callElement.SrcID, callElement.SrcID, "host")
			jsonObj.S(callElement.SrcID).Set(position, "position")
			host.Merge(jsonObj)
			position++
		}

		if !host.Exists(callElement.DstID) {
			jsonObj := gabs.New()
			jsonObj.Array(callElement.DstID, "host")
			jsonObj.ArrayAppend(callElement.DstID, callElement.DstID, "host")
			jsonObj.S(callElement.DstID).Set(position, "position")
			host.Merge(jsonObj)
			position++
		}

		callElement.Destination = host.Search(callElement.DstID, "position").Data().(int)
		callData = append(callData, callElement)
		for key := range dataElement.ChildrenMap() {
			if !function.ArrayKeyExits(key, dataKeys) {
				dataKeys.ArrayAppend(key)
			}
		}
		dataReply.ArrayAppend(dataElement.Data())

	}

	total, _ := dataReply.ArrayCount()
	reply := gabs.New()
	reply.Set(total, "total")
	reply.Set(dataReply.Data(), "data", "messages")
	reply.Set(host.Data(), "data", "hosts")
	reply.Set(callData, "data", "calldata")
	reply.Set(alias.Data(), "data", "alias")
	reply.Set(dataKeys.Data(), "keys")
	return reply.String()
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) GetTransactionQos(tables [2]string, data []byte, nodes []string) (string, error) {

	var dataWhere []interface{}
	sid := gabs.New()
	reply := gabs.New()
	requestData, _ := gabs.ParseJSON(data)
	for _, value := range requestData.Search("param", "search").ChildrenMap() {
		if value.Exists("callid") {
			dataWhere = append(dataWhere, value.Search("callid").Data().([]interface{})...)
		}
	}
	timeWhereFrom := requestData.S("timestamp", "from").Data().(float64)
	timeWhereTo := requestData.S("timestamp", "to").Data().(float64)
	timeFrom := time.Unix(int64(timeWhereFrom/float64(time.Microsecond)), 0).UTC()
	timeTo := time.Unix(int64(timeWhereTo/float64(time.Microsecond)), 0).UTC()

	for i, table := range tables {
		searchData := []model.HepTable{}
		dataReply := gabs.Wrap([]interface{}{})

		query := "sid in (?) and create_date between ? and ?"

		for session := range ss.Session {
			/* if node doesnt exists - continue */
			if !heputils.ElementExists(nodes, session) {
				continue
			}

			searchTmp := []model.HepTable{}
			if err := ss.Session[session].Debug().
				Table(table).
				Where(query, dataWhere, timeFrom.Format(time.RFC3339), timeTo.Format(time.RFC3339)).
				Find(&searchTmp).Error; err != nil {
				logger.Error("GetTransactionQos: We have got error: ", err)
				return "", err

			}

			if len(searchTmp) > 0 {
				for val := range searchTmp {
					searchTmp[val].Node = session
					searchTmp[val].DBNode = session
				}
				searchData = append(searchData, searchTmp...)
			}
		}

		/* lets sort it */
		sort.Slice(searchData, func(i, j int) bool {
			return searchData[i].CreatedDate.Before(searchData[j].CreatedDate)
		})

		response, _ := json.Marshal(searchData)
		row, _ := gabs.ParseJSON(response)
		for _, value := range row.Children() {
			dataElement := gabs.New()
			for k, v := range value.ChildrenMap() {
				switch k {
				case "data_header", "protocol_header":
					dataElement.Merge(v)
				case "sid", "correlation_id":
					sidData := gabs.New()
					sidData.Set(v.Data().(interface{}), k)
					dataElement.Merge(sidData)
					sid.Set(v.Data().(interface{}), k)
				default:
					newData := gabs.New()
					newData.Set(v.Data().(interface{}), k)
					dataElement.Merge(newData)
				}
			}
			dataReply.ArrayAppend(dataElement.Data())
		}

		dataQos := gabs.New()
		totalEl, _ := dataReply.ArrayCount()
		dataQos.Set(totalEl, "total")
		dataQos.Set(dataReply.Data(), "data")
		reply.Set(dataQos.Data(), xconditions.IfThenElse(i == 0, "rtcp", "rtp").(string))
	}

	return reply.String(), nil
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) GetTransactionLog(table string, data []byte, nodes []string) (string, error) {

	var dataWhere []interface{}
	sid := gabs.New()
	searchData := []model.HepTable{}
	dataReply := gabs.Wrap([]interface{}{})
	requestData, _ := gabs.ParseJSON(data)
	for _, value := range requestData.Search("param", "search").ChildrenMap() {
		if value.Exists("callid") {
			dataWhere = append(dataWhere, value.Search("callid").Data().([]interface{})...)
		}
	}
	timeWhereFrom := requestData.S("timestamp", "from").Data().(float64)
	timeWhereTo := requestData.S("timestamp", "to").Data().(float64)
	timeFrom := time.Unix(int64(timeWhereFrom/float64(time.Microsecond)), 0).UTC()
	timeTo := time.Unix(int64(timeWhereTo/float64(time.Microsecond)), 0).UTC()

	query := "sid in (?) and create_date between ? and ?"
	for session := range ss.Session {
		/* if node doesnt exists - continue */
		if !heputils.ElementExists(nodes, session) {
			continue
		}
		searchTmp := []model.HepTable{}
		if err := ss.Session[session].Debug().
			Table(table).
			Where(query, dataWhere, timeFrom.Format(time.RFC3339), timeTo.Format(time.RFC3339)).
			Find(&searchTmp).Error; err != nil {
			logger.Error("GetTransactionLog: We have got error: ", err)
			return "", err

		}

		if len(searchTmp) > 0 {
			for val := range searchTmp {
				searchTmp[val].Node = session
				searchTmp[val].DBNode = session
			}
			searchData = append(searchData, searchTmp...)
		}
	}

	response, _ := json.Marshal(searchData)
	row, _ := gabs.ParseJSON(response)
	for _, value := range row.Children() {
		dataElement := gabs.New()
		for k, v := range value.ChildrenMap() {
			switch k {
			case "data_header", "protocol_header":
				dataElement.Merge(v)
			case "sid", "correlation_id":
				sidData := gabs.New()
				sidData.Set(v.Data().(interface{}), k)
				dataElement.Merge(sidData)
				sid.Set(v.Data().(interface{}), k)
			default:
				newData := gabs.New()
				newData.Set(v.Data().(interface{}), k)
				dataElement.Merge(newData)
			}
		}
		dataReply.ArrayAppend(dataElement.Data())
	}

	total, _ := dataReply.ArrayCount()
	reply := gabs.New()
	reply.Set(total, "total")
	reply.Set(dataReply.Data(), "data")
	return reply.String(), nil
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) ImportPcapData(buf *bytes.Buffer, now bool) (int, int, error) {

	if config.Setting.DECODER_SHARK.Enable {
		logger.Debug("Decoded KEY")
		logger.Debug("Trying to debug using external decoder")
		logger.Debug(fmt.Sprintf("Decoder to [%s, %s, %v]\n", config.Setting.DECODER_SHARK.Bin, config.Setting.DECODER_SHARK.Param, config.Setting.DECODER_SHARK.Protocols))
		rootExecute := false
		cmd := exec.Command(config.Setting.DECODER_SHARK.Bin, "-Q", "-T", "json", "-o", "rtp.heuristic_rtp:TRUE", "-l", "-i", "-", config.Setting.DECODER_SHARK.Param)
		/* check if we are root under root - change to a configured user */
		uid, gid := os.Getuid(), os.Getgid()

		if uid == 0 || gid == 0 {
			logger.Info(fmt.Sprintf("running under root/wheel: UID: [%d], GID: [%d]. Configured: UID: [%d] GID: [%d].", uid, gid, config.Setting.DECODER_SHARK.UID, config.Setting.DECODER_SHARK.GID))
			if config.Setting.DECODER_SHARK.UID != 0 && config.Setting.DECODER_SHARK.GID != 0 {
				logger.Info(fmt.Sprintf("Attempting to change user to: UID: [%d], GID: [%d]", config.Setting.DECODER_SHARK.UID, config.Setting.DECODER_SHARK.GID))
				cmd.SysProcAttr = &syscall.SysProcAttr{
					Credential: &syscall.Credential{
						Uid: config.Setting.DECODER_SHARK.UID, Gid: config.Setting.DECODER_SHARK.GID,
						NoSetGroups: true,
					},
				}
			} else {
				logger.Error("You run external decoder under root! Please set UID/GID in the config")
				rootExecute = true
			}
		}

		stdin, err := cmd.StdinPipe()
		if err != nil {
			logger.Error("Bad cmd stdin", err)
			return 0, 0, err
		}
		go func() {
			defer stdin.Close()
			io.WriteString(stdin, buf.String())
		}()

		out, err := cmd.CombinedOutput()
		if err != nil {
			logger.Error("Bad combined output: ", err)
			return 0, 0, err
		}

		var skipElement = 0

		/* this is fix if you run the webapp under root */
		if rootExecute {
			/* limit search String */
			maxEl := len(out)
			if maxEl > 100 {
				maxEl = 100
			}
			for i := 0; i < maxEl; i++ {
				if string(out[i]) == "[" || string(out[i]) == "{" {
					skipElement = i
					break
				}
			}
		}

		//tmpRawData := model.TableRawData{}
		//for session := range ss.Session {
		var session *gorm.DB

		if config.Setting.DECODER_SHARK.ImportNode != "" {
			if val, ok := ss.Session[config.Setting.DECODER_SHARK.ImportNode]; ok {
				session = val
			} else {
				keys := reflect.ValueOf(ss.Session).MapKeys()
				session = ss.Session[keys[0].String()]
			}
		} else {
			keys := reflect.ValueOf(ss.Session).MapKeys()
			session = ss.Session[keys[0].String()]
		}

		badCounter := 0
		goodCounter := 0
		var addTimeDifferent time.Duration
		addTimeDifferent = 0

		sData, err := gabs.ParseJSON(out[skipElement:])
		for _, dataElement := range sData.Children() {

			protocolHeader := gabs.New()
			dataHeader := gabs.New()
			var ipProto, srcPort, dstPort uint16
			var sourceIp, destinationIp string

			if dataElement.Exists("_source", "layers") {

				tmpData := model.TableRawData{}

				layerData := dataElement.S("_source", "layers")

				if layerData.Exists("frame", "frame.time_epoch") {
					timeArray := strings.Split(layerData.S("frame", "frame.time_epoch").Data().(string), ".")
					timeSec, _ := strconv.ParseInt(timeArray[0], 10, 64)
					timeUSec, _ := strconv.ParseInt(timeArray[1], 10, 64)
					unixTimeUTC := time.Unix(timeSec, timeUSec) //gives unix time stamp in utc

					if now {
						if addTimeDifferent == 0 {
							tNow := time.Now()
							addTimeDifferent = tNow.Sub(unixTimeUTC)
						}
						unixTimeUTC = unixTimeUTC.Add(addTimeDifferent)
					}

					tmpData.CreateDate = unixTimeUTC
				}

				if layerData.Exists("ip", "ip.proto") {
					val, _ := strconv.ParseUint(layerData.S("ip", "ip.proto").Data().(string), 10, 16)
					ipProto = uint16(val)
					protocolHeader.Set(ipProto, "proto")
				}

				if layerData.Exists("ip", "ip.version") {
					val := layerData.S("ip", "ip.version").Data().(string)
					protocolHeader.Set(val, "ip_version")
				}

				/* Check IP */
				if layerData.Exists("ip", "ip.src") {
					val := layerData.S("ip", "ip.src").Data().(string)
					protocolHeader.Set(val, "srcIp")
				}
				if layerData.Exists("ip", "ip.dst") {
					val := layerData.S("ip", "ip.dst").Data().(string)
					protocolHeader.Set(val, "dstIp")
				}

				/* udp */
				if ipProto == 17 {
					if layerData.Exists("udp", "udp.srcport") {
						val, _ := strconv.ParseUint(layerData.S("udp", "udp.srcport").Data().(string), 10, 16)
						srcPort = uint16(val)
						protocolHeader.Set(srcPort, "srcPort")
					}
					if layerData.Exists("udp", "udp.dstport") {
						val, _ := strconv.ParseUint(layerData.S("udp", "udp.dstport").Data().(string), 10, 16)
						dstPort = uint16(val)
						protocolHeader.Set(dstPort, "dstPort")
					}
					/* tcp */
				} else if ipProto == 5 {
					if layerData.Exists("tcp", "tcp.srcport") {
						val, _ := strconv.ParseUint(layerData.S("tcp", "tcp.srcport").Data().(string), 10, 16)
						srcPort = uint16(val)
						protocolHeader.Set(srcPort, "srcPort")
					}
					if layerData.Exists("tcp", "tcp.dstport") {
						val, _ := strconv.ParseUint(layerData.S("tcp", "tcp.dstport").Data().(string), 10, 16)
						dstPort = uint16(val)
						protocolHeader.Set(dstPort, "dstPort")
					}
					/* sctp */
				} else if ipProto == 132 {
					if layerData.Exists("sctp", "sctp.srcport") {
						val, _ := strconv.ParseUint(layerData.S("sctp", "sctp.srcport").Data().(string), 10, 16)
						srcPort = uint16(val)
						protocolHeader.Set(srcPort, "srcPort")
					}
					if layerData.Exists("sctp", "sctp.dstport") {
						val, _ := strconv.ParseUint(layerData.S("sctp", "sctp.dstport").Data().(string), 10, 16)
						dstPort = uint16(val)
						protocolHeader.Set(dstPort, "dstPort")
					}
				}

				hashIPPort := fmt.Sprintf("%s:%d->%s:%d", sourceIp, srcPort, destinationIp, dstPort)
				tmpData.SID = strconv.FormatUint(uint64(heputils.Hash32(hashIPPort)), 10)

				if layerData.Exists("frame") {
					frame := layerData.S("frame").Data()
					data := gabs.New()
					data.Set(frame, "frame")
					tmpData.Raw = data.Bytes()
				}

				dataHeader.Set(tmpData.SID, "callid")
				dataHeader.Set("event", "method")

				tmpData.ProtocolHeader = protocolHeader.Data().([]byte)
				tmpData.DataHeader = dataHeader.Data().([]byte)

				db := session.Save(&tmpData)
				if db != nil && db.Error != nil {
					logger.Error(fmt.Sprintf("Save failed for table [%s]: with error %s.", tmpData.TableName(), db.Error.Error()))
				} else {
					logger.Debug(fmt.Sprintf("Save for table [%s] was success.", tmpData.TableName()))
				}

				goodCounter++
			}
		}

		if err != nil {
			logger.Error(fmt.Sprintf("Commit transaction Error: %s", err.Error()))
			return goodCounter, badCounter, err
		}

		//logger.Debug("DDD:", sData)
		return goodCounter, badCounter, err
	}

	return 0, 0, fmt.Errorf("tshark has not been enabled")
}
