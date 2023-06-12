package service

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/Jeffail/gabs"
	"github.com/sipcapture/homer-app/config"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/system/webmessages"
	"github.com/sipcapture/homer-app/utils/logger"
)

// StatisticService : here you tell us what Salutation is
type GrafanaService struct {
	ServiceConfig
	ServiceGrafana
}

// This method will return sub-path from config to UI
func (ps *GrafanaService) GrafanaPath() (string, error) {

	urlGrafana := ""
	replyData := gabs.New()

	if !config.Setting.GRAFANA_SETTINGS.Enable {
		urlGrafana = "grafana"
	} else {
		urlGrafana = config.Setting.GRAFANA_SETTINGS.Path
	}

	replyData.Set(urlGrafana, "data")
	return replyData.String(), nil
}

// This method returns Grafana Host from config
func (ps *GrafanaService) GrafanaURL() (string, error) {

	urlGrafana := ""
	replyData := gabs.New()

	if !config.Setting.GRAFANA_SETTINGS.Enable {
		var userGlobalSettings = model.TableGlobalSettings{}

		if err := ps.Session.Debug().Table("global_settings").
			Where("param = ?", "grafana").
			Find(&userGlobalSettings).Error; err != nil {
			return "", err
		}

		sData, _ := gabs.ParseJSON(userGlobalSettings.Data)
		urlGrafana = ps.Host

		if sData.Exists("host") {
			urlGrafana = sData.Search("host").Data().(string)
		}
	} else {
		urlGrafana = config.Setting.GRAFANA_SETTINGS.URL
	}

	replyData.Set(urlGrafana, "data")
	return replyData.String(), nil
}

// This method returns if Grafana is enabled in the system
func (ps *GrafanaService) GrafanaStatus() (string, error) {

	replyData := gabs.New()
	replyStatus := gabs.New()

	replyStatus.Set(config.Setting.GRAFANA_SETTINGS.Enable, "enable")
	replyData.Set(replyStatus.Data(), "data")

	return replyData.String(), nil
}

// This method sets values in service based on Config
func (ps *GrafanaService) SetGrafanaObject() error {

	// assign only need
	if !config.Setting.GRAFANA_SETTINGS.Enable {
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
	} else {
		ps.Host = config.Setting.GRAFANA_SETTINGS.URL
		ps.User = config.Setting.GRAFANA_SETTINGS.User
		ps.Password = config.Setting.GRAFANA_SETTINGS.Password
		ps.Token = config.Setting.GRAFANA_SETTINGS.AuthKey
	}

	return nil
}

// This method returns Grafana Organisation
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
	defer ps.HttpClient.CloseIdleConnections()
	println("token" + ps.Token)
	if err != nil {
		logger.Error("Couldn't make http query:", grafanaQuery)
		println("ERROR IN HTTP REQUEST" + grafanaQuery)
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
		logger.Error("error parsing: ", err.Error())
		return "", err
	}

	if data.StatusCode >= 400 {
		err = fmt.Errorf("receive bad response from grafana: %d", data.StatusCode)
		logger.Error("error: ", err.Error())
		reply := gabs.New()
		reply.Set("1048", "errorcode")
		reply.Set(webmessages.GrafanaProcessingError+fmt.Sprintf(" httpcode: %d", data.StatusCode), "message")
		reply.Set(sData.Data(), "data")
		return reply.String(), nil
	}

	return sData.String(), nil

}

// This method returns all Grafana Folders
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
	defer ps.HttpClient.CloseIdleConnections()

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

	if data.StatusCode >= 400 {
		reply := gabs.New()
		reply.Set("1048", "errorcode")
		reply.Set(webmessages.GrafanaProcessingError+fmt.Sprintf(" httpcode: %d", data.StatusCode), "message")
		reply.Set(sData.Data(), "data")
		err = fmt.Errorf("receive bad response from grafana: ", data.StatusCode)
		logger.Error("error: ", err.Error())
		return reply.String(), err
	}

	return sData.String(), nil

}

// This method perfroms search in Grafana for Dashboard by UUID
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
	defer ps.HttpClient.CloseIdleConnections()

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

	if data.StatusCode >= 400 {
		reply := gabs.New()
		reply.Set("1048", "errorcode")
		reply.Set(webmessages.GrafanaProcessingError+fmt.Sprintf(" httpcode: %d", data.StatusCode), "message")
		reply.Set(sData.Data(), "data")
		err = fmt.Errorf("receive bad response from grafana: ", data.StatusCode)
		logger.Error("error: ", err.Error())
		return reply.String(), err
	}

	return sData.String(), nil

}

// This method perfroms search in Grafana for Dashboard Folder by UUID
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
	defer ps.HttpClient.CloseIdleConnections()

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

	if data.StatusCode >= 400 {
		reply := gabs.New()
		reply.Set("1048", "errorcode")
		reply.Set(webmessages.GrafanaProcessingError+fmt.Sprintf(" httpcode: %d", data.StatusCode), "message")
		reply.Set(sData.Data(), "data")
		err = fmt.Errorf("receive bad response from grafana: ", data.StatusCode)
		logger.Error("error: ", err.Error())
		return reply.String(), err
	}

	return sData.String(), nil

}

// This method returns Grafana dashboard by UUID
func (ps *GrafanaService) GrafanaGetDashboardRequest(dashboard string, uuid string, query string) (string, error) {

	grafanaQuery := fmt.Sprintf("%s/d/%s/%s?%s", ps.Host, dashboard, uuid, query)

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
	defer ps.HttpClient.CloseIdleConnections()

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

	//dataResponse := string(buf)
	dataResponse := strings.ReplaceAll(string(buf), "base href=\"/\"", "base href=\"/grafana/\"")

	return dataResponse, nil

}
