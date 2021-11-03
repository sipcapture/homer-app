package service

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/Jeffail/gabs"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/logger"
)

// StatisticService : here you tell us what Salutation is
type GrafanaService struct {
	ServiceConfig
	ServiceGrafana
}

// LabelsData: this method get all Grafana labels from database
func (ps *GrafanaService) GrafanaURL() (string, error) {

	var userGlobalSettings = model.TableGlobalSettings{}

	if err := ps.Session.Debug().Table("global_settings").
		Where("param = ?", "grafana").
		Find(&userGlobalSettings).Error; err != nil {
		return "", err
	}

	sData, _ := gabs.ParseJSON(userGlobalSettings.Data)
	replyData := gabs.New()
	urlGrafana := ps.Host

	if sData.Exists("host") {
		urlGrafana = sData.Search("host").Data().(string)
	}

	replyData.Set(urlGrafana, "data")
	return replyData.String(), nil
}

func (ps *GrafanaService) SetGrafanaObject() error {

	var userGlobalSettings = model.TableGlobalSettings{}

	if err := ps.Session.Debug().Table("global_settings").
		Where("param = ?", "grafana").
		Find(&userGlobalSettings).Error; err != nil {
		return err
	}

	sData, _ := gabs.ParseJSON(userGlobalSettings.Data)

	if sData.Exists("host") {
		ps.Host = sData.Search("host").Data().(string)
	}

	if sData.Exists("user") {
		ps.User = sData.Search("user").Data().(string)
	}

	if sData.Exists("password") {
		ps.Password = sData.Search("password").Data().(string)
	}

	if sData.Exists("token") {
		ps.Token = sData.Search("token").Data().(string)
	}

	return nil
}

// LabelsData: this method get all Grafana labels from database
func (ps *GrafanaService) GrafanaORG() (string, error) {

	grafanaQuery := fmt.Sprintf("%s/api/org", ps.Host)

	req, err := http.NewRequest("GET", grafanaQuery, nil)

	if err != nil {
		logger.Error("Couldn't make NewRequest query:", grafanaQuery)
		return "", err
	}

	// This one line implements the authentication required for the task.
	if ps.Password != "" && ps.User != "" {
		req.SetBasicAuth(ps.User, ps.Password)
	}

	req.Header.Add("Authorization", "Bearer "+ps.Token)

	data, err := ps.HttpClient.Do(req)
	if err != nil {
		logger.Error("Couldn't make http query:", grafanaQuery)
		return "", err
	}

	defer data.Body.Close()

	buf, _ := ioutil.ReadAll(data.Body)
	if err != nil {
		logger.Error("Couldn't read the data from IO-Buffer")
		return "", err
	}

	sData, err := gabs.ParseJSON(buf)
	if err != nil {
		logger.Error("couldn't encode json body")
		return "", err
	}
	return sData.String(), nil

}

// LabelsData: this method get all Grafana labels from database
func (ps *GrafanaService) GrafanaFolders() (string, error) {

	grafanaQuery := fmt.Sprintf("%s/api/search?folderIds=0", ps.Host)

	req, err := http.NewRequest("GET", grafanaQuery, nil)

	if err != nil {
		logger.Error("Couldn't make NewRequest query:", grafanaQuery)
		return "", err
	}

	// This one line implements the authentication required for the task.
	if ps.Password != "" && ps.User != "" {
		req.SetBasicAuth(ps.User, ps.Password)
	}

	req.Header.Add("Authorization", "Bearer "+ps.Token)

	data, err := ps.HttpClient.Do(req)
	if err != nil {
		logger.Error("Couldn't make http query:", grafanaQuery)
		return "", err
	}

	defer data.Body.Close()

	buf, _ := ioutil.ReadAll(data.Body)
	if err != nil {
		logger.Error("Couldn't read the data from IO-Buffer")
		return "", err
	}

	sData, err := gabs.ParseJSON(buf)
	if err != nil {
		logger.Error("couldn't encode json body")
		return "", err
	}
	return sData.String(), nil

}

//LabelsData: this method get all Grafana labels from database
func (ps *GrafanaService) GrafanaGetDashboardByUUUID(uuid string) (string, error) {

	grafanaQuery := fmt.Sprintf("%s/api/dashboards/uid/%s", ps.Host, uuid)

	req, err := http.NewRequest("GET", grafanaQuery, nil)

	if err != nil {
		logger.Error("Couldn't make NewRequest query:", grafanaQuery)
		return "", err
	}

	// This one line implements the authentication required for the task.
	if ps.Password != "" && ps.User != "" {
		req.SetBasicAuth(ps.User, ps.Password)
	}

	req.Header.Add("Authorization", "Bearer "+ps.Token)

	data, err := ps.HttpClient.Do(req)
	if err != nil {
		logger.Error("Couldn't make http query:", grafanaQuery)
		return "", err
	}

	defer data.Body.Close()

	buf, _ := ioutil.ReadAll(data.Body)
	if err != nil {
		logger.Error("Couldn't read the data from IO-Buffer")
		return "", err
	}

	sData, err := gabs.ParseJSON(buf)
	if err != nil {
		logger.Error("couldn't encode json body")
		return "", err
	}
	return sData.String(), nil

}

//LabelsData: this method get all Grafana labels from database
func (ps *GrafanaService) GrafanaGetFoldersdByUUUID(uuid string) (string, error) {

	grafanaQuery := fmt.Sprintf("%s/api/search?folderIds=%s", ps.Host, uuid)

	req, err := http.NewRequest("GET", grafanaQuery, nil)

	if err != nil {
		logger.Error("Couldn't make NewRequest query:", grafanaQuery)
		return "", err
	}

	// This one line implements the authentication required for the task.
	if ps.Password != "" && ps.User != "" {
		req.SetBasicAuth(ps.User, ps.Password)
	}

	req.Header.Add("Authorization", "Bearer "+ps.Token)

	data, err := ps.HttpClient.Do(req)
	if err != nil {
		logger.Error("Couldn't make http query:", grafanaQuery)
		return "", err
	}

	defer data.Body.Close()

	buf, _ := ioutil.ReadAll(data.Body)
	if err != nil {
		logger.Error("Couldn't read the data from IO-Buffer")
		return "", err
	}

	sData, err := gabs.ParseJSON(buf)
	if err != nil {
		logger.Error("couldn't encode json body")
		return "", err
	}
	return sData.String(), nil

}
