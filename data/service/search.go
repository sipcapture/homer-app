package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/Jeffail/gabs/v2"
	"github.com/dop251/goja"
	"github.com/shomali11/util/xconditions"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/exportwriter"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sipcapture/homer-app/utils/logger/function"
	"github.com/sirupsen/logrus"
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

func executeJSFunction(jsString string, callIds []interface{}) []interface{} {

	vm := goja.New()

	//jsString := "var returnData=[]; for (var i = 0; i < data.length; i++) { returnData.push(data[i]+'_b2b-1'); }; returnData;"
	// "input_function_js": "var returnData=[]; for (var i = 0; i < data.length; i++) { returnData.push(data[i]+'_b2b-1'); }; returnData;"

	vm.Set("data", callIds)

	v, err := vm.RunString(jsString)

	if err != nil {
		logrus.Errorln("Script error", err)
		return nil
	}

	data := v.Export().([]interface{})

	//fmt.Println("RESULT", data[0])
	//b := make([]interface{}, len(a))
	/* for i := range data {
		fmt.Println("VAL", data[i])
	}
	*/

	return data
}

func buildQuery(elems []interface{}) (sql string, sLimit int) {
	sLimit = 200
	for k, v := range elems {
		mapData := v.(map[string]interface{})
		if formVal, ok := mapData["value"]; ok {
			formValue := formVal.(string)
			formName := mapData["name"].(string)
			formType := mapData["type"].(string)
			notStr := ""
			equalStr := "="
			operator := " AND "
			logrus.Debug(k, ". formName: ", formName)
			logrus.Debug(k, ". formValue: ", formValue)
			logrus.Debug(k, ". formType: ", formType)

			if strings.HasPrefix(formValue, "||") {
				formValue = strings.TrimPrefix(formValue, "||")
				if k > 0 {
					operator = " OR "
				}
			}
			if strings.HasPrefix(formValue, "!") {
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
					sql = sql + operator + fmt.Sprintf("(%s->>'%s')::int%s%d", elemArray[0], elemArray[1], equalStr, heputils.CheckIntValue(formValue))
					continue
				}

				if strings.Contains(formValue, "%") && strings.Contains(formValue, ";") {
					sql = sql + operator + fmt.Sprintf("%s->>'%s' %sLIKE ANY ('{%s}')", elemArray[0], elemArray[1], notStr, heputils.Sanitize(formValue))
					sql = strings.Replace(sql, ";", ",", -1)
				} else if strings.Contains(formValue, "%") {
					sql = sql + operator + fmt.Sprintf("%s->>'%s' %sLIKE '%s'", elemArray[0], elemArray[1], notStr, heputils.Sanitize(formValue))
				} else if strings.Contains(formValue, ",") || len(valueArray) > 1 {
					sql = sql + operator + fmt.Sprintf("%s->>'%s' %sIN ('%s')", elemArray[0], elemArray[1], notStr, strings.Join(valueArray[:], "','"))
				} else {
					sql = sql + operator + fmt.Sprintf("%s->>'%s'%s'%s'", elemArray[0], elemArray[1], equalStr, strings.Join(valueArray[:], "','"))
				}
				continue
			}

			if formType == "integer" {
				sql = sql + operator + fmt.Sprintf("%s%s%d", formName, equalStr, heputils.CheckIntValue(formValue))
				continue
			}

			if strings.Contains(formValue, "%") {
				sql = sql + operator + formName + notStr + " LIKE '" + heputils.Sanitize(formValue) + "'"
			} else {
				sql = sql + operator + fmt.Sprintf("%s %sIN ('%s')", formName, notStr, strings.Join(valueArray[:], "','"))
			}
		}
	}
	return sql, sLimit
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) SearchData(searchObject *model.SearchObject, aliasData map[string]string) (string, error) {
	table := "hep_proto_1_default"
	searchData := []model.HepTable{}
	searchFromTime := time.Unix(searchObject.Timestamp.From/int64(time.Microsecond), 0)
	searchToTime := time.Unix(searchObject.Timestamp.To/int64(time.Microsecond), 0)
	Data, _ := json.Marshal(searchObject.Param.Search)
	sData, _ := gabs.ParseJSON(Data)
	sql := "create_date between ? AND ?"
	var sLimit int

	for key, _ := range sData.ChildrenMap() {
		table = "hep_proto_" + key
		if sData.Exists(key) {
			elems := sData.Search(key).Data().([]interface{})
			s, l := buildQuery(elems)
			sql += s
			sLimit = l
		}
	}

	//var searchData
	for session := range ss.Session {
		searchTmp := []model.HepTable{}

		/* if node doesnt exists - continue */
		if !heputils.ElementExists(searchObject.Param.Location.Node, session) {
			continue
		}

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
			case "data_header", "protocol_header":
				dataElement.Merge(v)
			case "id", "sid", "node", "dbnode":
				newData := gabs.New()
				newData.Set(v.Data().(interface{}), k)
				dataElement.Merge(newData)
			}
		}

		srcIPPort := dataElement.S("srcIp").Data().(string) + ":" + strconv.FormatFloat(dataElement.S("srcPort").Data().(float64), 'f', 0, 64)
		dstIPPort := dataElement.S("dstIp").Data().(string) + ":" + strconv.FormatFloat(dataElement.S("dstPort").Data().(float64), 'f', 0, 64)
		srcIPPortZero := dataElement.S("srcIp").Data().(string) + ":" + "0"
		dstIPPortZero := dataElement.S("dstIp").Data().(string) + ":" + "0"

		if _, ok := aliasData[srcIPPort]; ok {
			alias.Set(srcIPPort, aliasData[srcIPPort])
		} else if _, ok := aliasData[srcIPPortZero]; ok {
			alias.Set(srcIPPort, aliasData[srcIPPortZero])
		}

		if _, ok := aliasData[dstIPPort]; ok {
			alias.Set(dstIPPort, aliasData[dstIPPort])
		} else if _, ok := aliasData[srcIPPortZero]; ok {
			alias.Set(dstIPPort, aliasData[dstIPPortZero])
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
			logrus.Errorln("Bad assigned array")
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
			elems := sData.Search(key, "id").Data().(float64)
			sql = sql + " and id = " + fmt.Sprintf("%d", int(elems))
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
			elems := sData.Search(key, "id").Data().(float64)
			sql = sql + " and id = " + fmt.Sprintf("%d", int(elems))
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
		logrus.Debug("Trying to debug using external decoder")
		logrus.Debug(fmt.Sprintf("Decoder to [%s, %s, %v]\n", ss.Decoder.Binary, ss.Decoder.Param, ss.Decoder.Protocols))
		//cmd := exec.Command(ss.Decoder.Binary, ss.Decoder.Param)
		var buffer bytes.Buffer
		export := exportwriter.NewWriter(buffer)
		var rootExecute = false

		// pcap export
		if err := export.WritePcapHeader(65536, 1); err != nil {
			logrus.Errorln("write error to the pcap header", err)
			return nil, err
		}

		if err := export.WriteDataPcapBuffer(dataRecord); err != nil {
			logrus.Errorln("write error to the pcap buffer", err)
			return nil, err
		}

		cmd := exec.Command(ss.Decoder.Binary, "-Q", "-T", "json", "-l", "-i", "-", ss.Decoder.Param)

		/*check if we root under root - changing to an user */
		uid, gid := os.Getuid(), os.Getgid()

		if uid == 0 || gid == 0 {
			logrus.Info("running under root/wheel: UID: [%d], GID: [%d] - [%d] - [%d]. Changing to user...", uid, gid, ss.Decoder.UID, ss.Decoder.GID)
			if ss.Decoder.UID != 0 && ss.Decoder.GID != 0 {
				logrus.Info("Changing to: UID: [%d], GID: [%d]", uid, gid)
				cmd.SysProcAttr = &syscall.SysProcAttr{
					Credential: &syscall.Credential{
						Uid: ss.Decoder.UID, Gid: ss.Decoder.GID,
						NoSetGroups: true,
					},
				}
			} else {
				logrus.Error("You run external decoder under root! Please set UID/GID in the config")
				rootExecute = true
			}
		}

		stdin, err := cmd.StdinPipe()
		if err != nil {
			logrus.Error("Bad cmd stdin", err)
			return nil, err
		}
		go func() {
			defer stdin.Close()
			io.WriteString(stdin, export.Buffer.String())
			return
		}()

		out, err := cmd.CombinedOutput()
		if err != nil {
			logrus.Error("Bad combined output: ", err)
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
			logrus.Error("bad json", err)
			return nil, err
		}

		return sData.Data(), nil
	}

	return nil, errors.New("decoder not active. You should not be here")
}

//this method create new user in the database
//it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) GetTransaction(table string, data []byte, correlationJSON []byte, doexp bool,
	aliasData map[string]string, typeReport int, nodes []string) (string, error) {
	var dataWhere []interface{}
	requestData, _ := gabs.ParseJSON(data)
	for key, value := range requestData.Search("param", "search").ChildrenMap() {
		table = "hep_proto_" + key
		for _, v := range value.Search("callid").Data().([]interface{}) {
			dataWhere = append(dataWhere, v)
		}
	}

	timeWhereFrom := requestData.S("timestamp", "from").Data().(float64)
	timeWhereTo := requestData.S("timestamp", "to").Data().(float64)
	timeFrom := time.Unix(int64(timeWhereFrom/float64(time.Microsecond)), 0).UTC()
	timeTo := time.Unix(int64(timeWhereTo/float64(time.Microsecond)), 0).UTC()

	dataRow, _ := ss.GetTransactionData(table, "sid", dataWhere, timeFrom, timeTo, nodes)
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
				if strings.Index(sf, ".") > -1 {
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

		if len(newWhereData) == 0 {
			continue
		}

		table := "hep_proto_" + strconv.FormatFloat(lookupID, 'f', 0, 64) + "_" + lookupProfile

		if len(lookupRange) > 0 {
			from = timeFrom.Add(time.Duration(lookupRange[0].(float64)) * time.Second).UTC()
			to = timeTo.Add(time.Duration(lookupRange[1].(float64)) * time.Second).UTC()
		}
		if lookupID == 0 {
			logrus.Error("We need to implement remote call here")
		} else {
			if sourceField == "data_header.callid" {

				logrus.Debug(lookupProfile)
				logrus.Debug(lookupField)
			}

			if corrs.Exists("input_function_js") {
				inputFunction := corrs.Search("input_function_js").Data().(string)
				//fmt.Println("Input function", inputFunction)
				newDataArray := executeJSFunction(inputFunction, newWhereData)
				//fmt.Println("input array", newWhereData)
				if newDataArray != nil {
					newWhereData = append(newWhereData, newDataArray...)
				}
			}

			if len(foundCidData) > 0 {
				for _, v := range foundCidData {
					newWhereData = append(newWhereData, v)
				}
			}

			newDataRow, _ := ss.GetTransactionData(table, lookupField, newWhereData, from, to, nodes)
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

			dataRow = append(dataRow, newDataRow...)
			logrus.Debug("Correlation data len:", len(dataRow))
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
				logrus.Errorln("write error to the pcap header", err)
			}
		}
		for _, h := range jsonParsed.Children() {

			if typeReport == 2 {
				err := export.WriteDataToBuffer(h)
				if err != nil {
					logrus.Errorln("write error to the buffer", err)
				}
			} else if typeReport == 1 {
				err := export.WriteDataPcapBuffer(h)
				if err != nil {
					logrus.Errorln("write error to the pcap buffer", err)
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
	return list
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (ss *SearchService) GetTransactionData(table string, fieldKey string, dataWhere []interface{}, timeFrom, timeTo time.Time, nodes []string) ([]model.HepTable, error) {

	searchData := []model.HepTable{}
	//transactionData := model.TransactionResponse{}
	query := fieldKey + " in (?) and create_date between ? and ?"

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
			logrus.Errorln("GetTransactionData: We have got error: ", err)
		}

		logrus.Debug("GetTransactionData: Len: ", len(searchTmp))

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
		}

		if dataElement.Exists("protocol") {
			callElement.Protocol = heputils.CheckFloatValue(dataElement.S("protocol").Data())
		}
		if dataElement.Exists("sid") {
			callElement.Sid = dataElement.S("sid").Data().(string)
		}
		if dataElement.Exists("raw") {
			callElement.RuriUser = dataElement.S("raw").Data().(string)
			callElement.RuriUser = callElement.RuriUser[:50]
		}

		callElement.SrcID = callElement.SrcHost + ":" + strconv.FormatFloat(callElement.SrcPort, 'f', 0, 64)
		callElement.DstID = callElement.DstHost + ":" + strconv.FormatFloat(callElement.DstPort, 'f', 0, 64)
		srcIPPort := callElement.SrcIP + ":" + strconv.FormatFloat(callElement.SrcPort, 'f', 0, 64)
		dstIPPort := callElement.DstIP + ":" + strconv.FormatFloat(callElement.DstPort, 'f', 0, 64)

		srcIPPortZero := callElement.SrcIP + ":" + strconv.Itoa(0)
		dstIPPortZero := callElement.DstIP + ":" + strconv.Itoa(0)

		if value, ok := aliasData[srcIPPort]; ok {
			alias.Set(value, srcIPPort)
		} else if value, ok := aliasData[srcIPPortZero]; ok {
			alias.Set(value, srcIPPort)
		}

		if value, ok := aliasData[dstIPPort]; ok {
			alias.Set(value, dstIPPort)
		} else if value, ok := aliasData[dstIPPortZero]; ok {
			alias.Set(value, dstIPPort)
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
		//table = "hep_proto_" + key
		for _, v := range value.Search("callid").Data().([]interface{}) {
			dataWhere = append(dataWhere, v)
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
				logrus.Errorln("GetTransactionQos: We have got error: ", err)
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
		//table = "hep_proto_" + key
		for _, v := range value.Search("callid").Data().([]interface{}) {
			dataWhere = append(dataWhere, v)
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
			logrus.Errorln("GetTransactionLog: We have got error: ", err)
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
