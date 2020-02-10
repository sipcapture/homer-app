package service

import (
	"encoding/json"
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

// StatisticData: this method create new user in the database
func (ps *RemoteService) RemoteData(remoteObject *model.RemoteObject) (string, error) {

	sLimit := remoteObject.Param.Limit
	searchFromTime := remoteObject.Timestamp.From
	searchToTime := remoteObject.Timestamp.To
	searchString := strings.Fields(remoteObject.Param.Search)
	searchRegexp := ""
	if len(searchString) > 1 {
		searchRegexp = searchString[1]
	}

	params := url.Values{}
	params.Add("query", searchString[0])
	params.Add("regexp", searchRegexp)
	params.Add("limit", strconv.Itoa(sLimit))
	params.Add("start", strconv.FormatInt(int64(searchFromTime)*1000000, 10))
	params.Add("end", strconv.FormatInt(int64(searchToTime)*1000000, 10))

	lokiQuery := fmt.Sprintf("%s/%s/query", ps.Host, ps.Api)

	// Let's start with a base url
	baseUrl, err := url.Parse(lokiQuery)
	if err != nil {
		logrus.Error("Malformed URL: ", err.Error())
	}

	baseUrl.RawQuery = params.Encode() // Escape Query Parameters

	//logrus.Error("Couldn't  query:", baseUrl.String())

	req, err := http.NewRequest("GET", baseUrl.String(), nil)

	if err != nil {
		logrus.Error("Couldn't make NewRequest query:", baseUrl.String())
		return "", err
	}

	// This one line implements the authentication required for the task.
	req.SetBasicAuth(ps.User, ps.Password)

	data, err := ps.HttpClient.Do(req)
	if err != nil {
		logrus.Error("Couldn't make http query:", baseUrl.String())
		return "", err
	}

	defer data.Body.Close()

	buf, _ := ioutil.ReadAll(data.Body)
	if err != nil {
		logrus.Error("Couldn't read the data from IO-Buffer")
		return "", err
	}

	var remoteValuesData RemoteValuesData
	json.Unmarshal(buf, &remoteValuesData)

	if err != nil {
		logrus.Error("couldn't decode json body")
		return "", err
	}

	dataReply := gabs.New()
	dataReply.Array("data")
	var index = 0
	for _, value := range remoteValuesData.Streams {
		for _, entryValue := range value.Entries {
			index++
			dataElement := gabs.New()
			dataElement.Set(index, "id")
			dataElement.Set(entryValue.Ts, "micro_ts")
			dataElement.Set(entryValue.Line, "custom_1")
			dataElement.Set(value.Labels, "custom_2")
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
