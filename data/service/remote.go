package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/Jeffail/gabs"
	"github.com/sipcapture/homer-app/model"
	"github.com/sirupsen/logrus"
)

// StatisticService : here you tell us what Salutation is
type RemoteService struct {
	ServiceLoki
}

// Salutation : here you tell us what Salutation is
// Printer : what is this?
// Greet : describe what this function does
// RemoteLabels : describe what this function does
type RemoteLabels struct {
	Values []string `json:"values"`
}

// swagger:model LabelData
type LabelRemoteData struct {
	Name     string `json:"__name__"`
	Instance string `json:"instance"`
	Job      string `json:"job"`
	Version  string `json:"version"`
}

type RemoteLabelData struct {
	Success string             `json:"success"`
	Data    []*LabelRemoteData `json:"data"`
}

// swagger:model LabelData
type queryRemoteResult struct {
	Type   string      `json:"resultType"`
	Result interface{} `json:"result"`
	// The decoded value.
}

// swagger:model LabelData
type entriesRemoteResult struct {
	Ts   string      `json:"ts"`
	Line interface{} `json:"line"`
}

// swagger:model LabelData
type streamsResult struct {
	Labels  interface{}           `json:"labels"`
	Entries []entriesRemoteResult `json:"entries"`
}

type RemoteValuesData struct {
	Streams []streamsResult `json:"streams"`
}

// swagger:model LabelData
type streamsNewResult struct {
	Stream interface{} `json:"stream"`
	Values [][]string  `json:"values"`
}

// swagger:model LabelData
type StreamRemoteData struct {
	Streams    []streamsNewResult `json:"result"`
	ResultType string             `json:"resultType"`
}
type RemoteValuesNewData struct {
	Success string            `json:"success"`
	Data    *StreamRemoteData `json:"data"`
}

// StatisticData: this method create new user in the database
func (ps *RemoteService) RemoteData(remoteObject *model.RemoteObject) (string, error) {

	sLimit := remoteObject.Param.Limit
	searchFromTime := remoteObject.Timestamp.From
	searchToTime := remoteObject.Timestamp.To
	searchString := ""
	searchRegexp := ""

	elAr := strings.Fields(remoteObject.Param.Search)
	if len(elAr) > 0 {
		searchString = elAr[0]
		if (len(searchString) + 2) < len(remoteObject.Param.Search) {
			searchRegexp = remoteObject.Param.Search[len(searchString)+2:]
		}
	}

	if searchString == "" {
		logrus.Error("search string is empty")
		return "", errors.New("empty string search")
	}

	params := url.Values{}
	params.Add("query", searchString)
	params.Add("regexp", searchRegexp)
	params.Add("limit", strconv.Itoa(sLimit))
	params.Add("start", strconv.FormatInt(int64(searchFromTime)*1000000, 10))
	params.Add("end", strconv.FormatInt(int64(searchToTime)*1000000, 10))

	lokiQuery := fmt.Sprintf("%s/%s/%s", ps.Host, ps.Api, ps.ParamQuery)

	// Let's start with a base url
	baseURL, err := url.Parse(lokiQuery)
	if err != nil {
		logrus.Error("Malformed URL: ", err.Error())
		return "", err
	}

	baseURL.RawQuery = params.Encode() // Escape Query Parameters

	req, err := http.NewRequest("GET", baseURL.String(), nil)

	if err != nil {
		logrus.Error("Couldn't make NewRequest query:", baseURL.String())
		return "", err
	}

	// This one line implements the authentication required for the task.
	req.SetBasicAuth(ps.User, ps.Password)

	data, err := ps.HttpClient.Do(req)
	if err != nil {
		logrus.Error("Couldn't make http query:", baseURL.String())
		return "", err
	}

	defer data.Body.Close()

	buf, _ := ioutil.ReadAll(data.Body)
	if err != nil {
		logrus.Error("Couldn't read the data from IO-Buffer")
		return "", err
	}

	var remoteValuesData RemoteValuesNewData
	json.Unmarshal(buf, &remoteValuesData)

	if err != nil {
		logrus.Error("couldn't decode json body")
		return "", err
	}

	if remoteValuesData.Data == nil || remoteValuesData.Data.Streams == nil {
		logrus.Error("no data found")
		return "", errors.New("no data found")
	}

	dataReply := gabs.New()
	dataReply.Array("data")
	var index = 0
	for _, value := range remoteValuesData.Data.Streams {
		for _, entryValue := range value.Values {
			index++
			var microTs int64
			dataLabel := ""
			microTs = 0
			if len(entryValue) > 1 {
				microTs, _ = strconv.ParseInt(entryValue[0], 10, 64)
				dataLabel = entryValue[1]
			}

			responseLabel, _ := json.Marshal(value.Stream)
			dataElement := gabs.New()
			dataElement.Set(index, "id")
			dataElement.Set(microTs, "micro_ts")
			dataElement.Set(dataLabel, "custom_1")
			dataElement.Set(string(responseLabel), "custom_2")
			dataReply.ArrayAppend(dataElement.Data(), "data")
		}
	}
	return dataReply.String(), nil
}

// LabelsData: this method get all Remote labels from database
func (ps *RemoteService) RemoteLabels(serverName string) (string, error) {

	if len(serverName) > 0 {
		serverName = ps.Host
	}

	lokiQuery := fmt.Sprintf("%s/%s/label", serverName, ps.Api)

	req, err := http.NewRequest("GET", lokiQuery, nil)

	if err != nil {
		logrus.Error("Couldn't make NewRequest query:", lokiQuery)
		return "", err
	}

	// This one line implements the authentication required for the task.
	req.SetBasicAuth(ps.User, ps.Password)

	data, err := ps.HttpClient.Do(req)
	if err != nil {
		logrus.Error("Couldn't make http query:", lokiQuery)
		return "", err
	}

	defer data.Body.Close()

	buf, _ := ioutil.ReadAll(data.Body)
	if err != nil {
		logrus.Error("Couldn't read the data from IO-Buffer")
		return "", err
	}

	var RemoteLebels RemoteLabels

	err = json.Unmarshal(buf, &RemoteLebels)
	if err != nil {
		logrus.Error("couldn't decode json body")
		return "", err
	}

	logrus.Debug("Response", RemoteLebels.Values)
	responseArray, _ := json.Marshal(RemoteLebels.Values)

	if err != nil {
		logrus.Error("couldn't encode json body")
		return "", err
	}

	//reply.Set(jObject.Data(), "data")
	return string(responseArray), nil
}

// LabelsData: this method get all Remote labels from database
func (ps *RemoteService) RemoteValues(serverName string, label string) (string, error) {

	if len(serverName) > 0 {
		serverName = ps.Host
	}

	lokiQuery := fmt.Sprintf("%s/%s/label/%s/values", serverName, ps.Api, label)

	req, err := http.NewRequest("GET", lokiQuery, nil)

	if err != nil {
		logrus.Error("Couldn't make NewRequest query:", lokiQuery)
		return "", err
	}

	// This one line implements the authentication required for the task.
	req.SetBasicAuth(ps.User, ps.Password)

	data, err := ps.HttpClient.Do(req)
	if err != nil {
		logrus.Error("Couldn't make http query:", lokiQuery)
		return "", err
	}

	defer data.Body.Close()

	buf, _ := ioutil.ReadAll(data.Body)
	if err != nil {
		logrus.Error("Couldn't read the data from IO-Buffer")
		return "", err
	}

	var RemoteLebels RemoteLabels

	json.Unmarshal(buf, &RemoteLebels)

	if err != nil {
		logrus.Error("couldn't decode json body")
		return "", err
	}

	logrus.Debug("Response", RemoteLebels.Values)
	responseArray, _ := json.Marshal(RemoteLebels.Values)

	if err != nil {
		logrus.Error("couldn't encode json body")
		return "", err
	}

	//reply.Set(jObject.Data(), "data")
	return string(responseArray), nil
}
