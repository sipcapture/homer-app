package service

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/Jeffail/gabs/v2"
	"github.com/sirupsen/logrus"
	"github.com/sipcapture/homer-app/model"
)

// StatisticService : here you tell us what Salutation is
type PrometheusService struct {
	ServicePrometheus
}

// Salutation : here you tell us what Salutation is
// Printer : what is this?
// Greet : describe what this function does
// PrometheusLabels : describe what this function does
type PrometheusLabels struct {
	Success string   `json:"success"`
	Data    []string `json:"data"`
}

// swagger:model LabelData
type LabelData struct {
	Name     string `json:"__name__"`
	Instance string `json:"instance"`
	Job      string `json:"job"`
	Version  string `json:"version"`
}

type PrometheusLabelData struct {
	Success string       `json:"success"`
	Data    []*LabelData `json:"data"`
}

// swagger:model LabelData
type ResultArray struct {
	Name     string `json:"__name__"`
	Instance string `json:"instance"`
	Job      string `json:"job"`
}

// swagger:model LabelData
type ValuesArray struct {
	Name     string `json:"__name__"`
	Instance string `json:"instance"`
	Job      string `json:"job"`
}

// swagger:model LabelData
type queryResult struct {
	Type   string      `json:"resultType"`
	Result interface{} `json:"result"`
	// The decoded value.
}

type PrometheusValuesData struct {
	Success string       `json:"success"`
	Data    *queryResult `json:"data"`
}

// StatisticData: this method create new user in the database
func (ps *PrometheusService) PrometheusData(prometheusObject *model.PrometheusObject) (string, error) {

	reply := gabs.New()
	return reply.String(), nil
}

// StatisticData: this method create new user in the database
func (ps *PrometheusService) PrometheusValue(prometheusObject *model.PrometheusObject) (string, error) {

	precision := prometheusObject.Param.Precision

	var prometheusValuesData []PrometheusValuesData

	for _, el := range prometheusObject.Param.Metrics {

		promQuery := fmt.Sprintf("%s/%s/query_range?query=%s&start=%d&end=%d&step=%d",
			ps.Host, ps.Api,
			el, (prometheusObject.Timestamp.From / 1000), (prometheusObject.Timestamp.To / 1000), precision)

		req, err := http.NewRequest("GET", promQuery, nil)

		if err != nil {
			logrus.Error("Couldn't make NewRequest query:", promQuery)
			return "", err
		}

		// This one line implements the authentication required for the task.
		req.SetBasicAuth(ps.User, ps.Password)

		data, err := ps.HttpClient.Do(req)
		if err != nil {
			logrus.Error("Couldn't make http query:", promQuery)
			return "", err
		}

		defer data.Body.Close()

		buf, _ := ioutil.ReadAll(data.Body)
		if err != nil {
			log.Fatal(err)
		}

		var tmpPromValData PrometheusValuesData

		json.Unmarshal(buf, &tmpPromValData)
		if err != nil {
			logrus.Error("couldn't decode json body")
			return "", err
		}
		prometheusValuesData = append(prometheusValuesData, tmpPromValData)

		//fmt.Println("Response", response)
		//this.promDb.get(`query_range?query=${metricName}&start=${fromts}&end=${tots}&step=${precision}`),
	}

	responseArray, err := json.Marshal(prometheusValuesData)
	if err != nil {
		logrus.Error("couldn't encode json body")
		return "", err
	}

	fmt.Println("Response", responseArray)

	return string(responseArray), nil
}

// LabelsData: this method get all prometheus labels from database
func (ps *PrometheusService) PrometheusLabels() (string, error) {

	timestamp := int32(time.Now().Unix())

	promQuery := fmt.Sprintf("%s/%s/label/__name__/values?=%d",
		ps.Host, ps.Api, timestamp)

	req, err := http.NewRequest("GET", promQuery, nil)

	if err != nil {
		logrus.Error("Couldn't make NewRequest query:", promQuery)
		return "", err
	}

	// This one line implements the authentication required for the task.
	req.SetBasicAuth(ps.User, ps.Password)

	data, err := ps.HttpClient.Do(req)
	if err != nil {
		logrus.Error("Couldn't make http query:", promQuery)
		return "", err
	}

	defer data.Body.Close()

	buf, _ := ioutil.ReadAll(data.Body)
	if err != nil {
		logrus.Error("Couldn't read the data from IO-Buffer")
		return "", err
	}

	var prometheusLebels PrometheusLabels

	json.Unmarshal(buf, &prometheusLebels)

	if err != nil {
		logrus.Error("couldn't decode json body")
		return "", err
	}

	fmt.Println("Response", prometheusLebels.Data)
	responseArray, _ := json.Marshal(prometheusLebels.Data)

	if err != nil {
		logrus.Error("couldn't encode json body")
		return "", err
	}

	//reply.Set(jObject.Data(), "data")
	return string(responseArray), nil
}

// LabelsData: this method get all prometheus labels from database
func (ps *PrometheusService) PrometheusLabelData(label string) (string, error) {

	promQuery := fmt.Sprintf("%s/%s/series?match[]=%s", ps.Host, ps.Api, label)

	req, err := http.NewRequest("GET", promQuery, nil)

	if err != nil {
		logrus.Error("Couldn't make NewRequest query:", promQuery)
		return "", err
	}

	// This one line implements the authentication required for the task.
	req.SetBasicAuth(ps.User, ps.Password)

	data, err := ps.HttpClient.Do(req)
	if err != nil {
		logrus.Error("Couldn't make http query:", promQuery)
		return "", err
	}

	defer data.Body.Close()

	buf, _ := ioutil.ReadAll(data.Body)
	if err != nil {
		logrus.Error("Couldn't read the data from IO-Buffer")
		return "", err
	}

	fmt.Println("Response1", string(buf))

	var prometheusLebelData PrometheusLabelData
	json.Unmarshal(buf, &prometheusLebelData)

	if err != nil {
		logrus.Error("couldn't decode json body")
		return "", err
	}

	fmt.Println("Response", prometheusLebelData.Data)
	responseArray, _ := json.Marshal(prometheusLebelData.Data)

	if err != nil {
		logrus.Error("couldn't encode json body")
		return "", err
	}

	return string(responseArray), nil
}
