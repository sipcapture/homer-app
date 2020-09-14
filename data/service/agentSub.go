package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
	"time"

	"sort"

	"github.com/Jeffail/gabs/v2"
	"github.com/sipcapture/homer-app/model"
	"github.com/sirupsen/logrus"
)

type AgentsubService struct {
	ServiceConfig
}

// this method gets all users from database
func (hs *AgentsubService) GetAgentsubAgainstGUID(guid string) (string, error) {
	var AgentsubObject []model.TableAgentLocationSession
	var count int
	if err := hs.Session.Debug().Table("agent_location_session").
		Where("guid = ?", guid).
		Find(&AgentsubObject).Count(&count).Error; err != nil {
		return "", err
	}
	if len(AgentsubObject) == 0 {
		return "", fmt.Errorf("no agent's record found for guid %s", guid)
	}
	sort.Slice(AgentsubObject[:], func(i, j int) bool {
		return AgentsubObject[i].GUID < AgentsubObject[j].GUID
	})

	response, _ := json.Marshal(AgentsubObject)
	dataElement, _ := gabs.ParseJSON(response)

	reply := gabs.New()
	reply.Set("agent record", "message")
	reply.Set(dataElement.Data(), "data")
	return reply.String(), nil
}

// this method gets all users from database
func (hs *AgentsubService) GetAgentsubAgainstType(typeRequest string) (string, error) {
	var AgentsubObject []model.TableAgentLocationSession
	var count int

	whereSQL := fmt.Sprintf("expire_date > NOW() AND type LIKE '%%%s%%'", typeRequest)

	if err := hs.Session.Debug().Table("agent_location_session").
		Where(whereSQL).
		Find(&AgentsubObject).Count(&count).Error; err != nil {
		return "", err
	}
	if len(AgentsubObject) == 0 {
		reply := gabs.New()
		reply.Set(fmt.Sprintf("no agent subscription object found for type [%s]", typeRequest), "message")
		reply.Set("", "data")
		return reply.String(), fmt.Errorf("no agent subscription object found for type %s", typeRequest)
	}
	sort.Slice(AgentsubObject[:], func(i, j int) bool {
		return AgentsubObject[i].GUID < AgentsubObject[j].GUID
	})

	response, _ := json.Marshal(AgentsubObject)
	dataElement, _ := gabs.ParseJSON(response)

	reply := gabs.New()
	reply.Set("agent record", "message")
	reply.Set(dataElement.Data(), "data")
	return reply.String(), nil
}

// this method gets all users from database
func (hs *AgentsubService) GetAuthKeyByHeaderToken(token string) (string, error) {
	var tokenObject model.TableAuthToken
	var count int
	if err := hs.Session.Debug().Table("auth_token").
		Where("expire_date > NOW() AND active = true AND token = ? ", token).
		Find(&tokenObject).Count(&count).Error; err != nil {
		return "", err
	}
	if count== 0 {
		return "", fmt.Errorf("no auth_token found or it has been expired: [%s]", token)
	}

	tokenObject.LastUsageDate = time.Now()

	if err := hs.Session.Debug().Table("auth_token").
		Where("token = ?", token).
		Update(&tokenObject).Error; err != nil {
		return "", err
	}
	response, _ := json.Marshal(tokenObject)
	dataElement, _ := gabs.ParseJSON(response)

	reply := gabs.New()
	reply.Set("auth record", "message")
	reply.Set(dataElement.Data(), "data")
	return reply.String(), nil
}

// this method gets all users from database
func (hs *AgentsubService) GetAgentsub() (string, error) {
	var AgentsubObject []model.TableAgentLocationSession
	var count int
	if err := hs.Session.Debug().Table("agent_location_session").
		Find(&AgentsubObject).Count(&count).Error; err != nil {
		return "", err
	}
	sort.Slice(AgentsubObject[:], func(i, j int) bool {
		return AgentsubObject[i].GUID < AgentsubObject[j].GUID
	})

	response, _ := json.Marshal(AgentsubObject)
	dataElement, _ := gabs.ParseJSON(response)

	reply := gabs.New()
	reply.Set("successfully created agent record", "message")
	reply.Set(dataElement.Data(), "data")
	return reply.String(), nil
}

// this method gets all users from database
func (hs *AgentsubService) AddAgentsub(data model.TableAgentLocationSession) (string, error) {
	if err := hs.Session.Debug().Table("agent_location_session").
		Create(&data).Error; err != nil {
		return "", err
	}

	sidData := gabs.New()
	sidData.Set(data.ExpireDate, "expire_date")
	sidData.Set(data.ExpireDate.Unix(), "expire_ts")
	sidData.Set(data.GUID, "uuid")
	reply := gabs.New()
	reply.Set("successfully created agent record", "message")
	reply.Set(sidData.Data(), "data")
	return reply.String(), nil
}

// this method gets all users from database
func (hs *AgentsubService) UpdateAgentsubAgainstGUID(guid string, data model.TableAgentLocationSession) (string, error) {
	if err := hs.Session.Debug().Table("agent_location_session").
		Where("guid = ?", guid).
		Update(&data).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully updated agent record\",\"data\":\"%s\"}", guid)
	return response, nil
}

// this method gets all users from database
func (hs *AgentsubService) DeleteAgentsubAgainstGUID(guid string) (string, error) {
	var AgentsubObject []model.TableAgentLocationSession
	if err := hs.Session.Debug().Table("agent_location_session").
		Where("guid = ? OR expire_date < NOW()", guid).
		Delete(&AgentsubObject).Error; err != nil {
		logrus.Println(err.Error())
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully deleted agent record\",\"data\":\"%s\"}", guid)
	return response, nil
}

// this method gets all users from database
func (hs *AgentsubService) GetAgentsubAgainstGUIDAndType(guid string, typeRequest string) (model.TableAgentLocationSession, error) {
	var AgentsubObject model.TableAgentLocationSession
	var count int

	whereSQL := fmt.Sprintf("expire_date > NOW() AND guid = '%s' AND type LIKE '%%%s%%'", guid, typeRequest)

	if err := hs.Session.Debug().Table("agent_location_session").
		Where(whereSQL).
		Find(&AgentsubObject).Count(&count).Error; err != nil {
		return AgentsubObject, err
	}

	return AgentsubObject, nil
}

// this method gets all users from database
func (hs *AgentsubService) DoSearchByPost(agentObject model.TableAgentLocationSession, searchObject model.SearchObject, typeRequest string) (string, error) {

	var hepsubObject []model.TableHepsubSchema
	/*
		response, _ := json.Marshal(agentObject)
		dataElement, _ := gabs.ParseJSON(response)
	*/

	Data, _ := json.Marshal(searchObject.Param.Search)
	sData, _ := gabs.ParseJSON(Data)
	var dataCallid []interface{}

	for key, value := range sData.ChildrenMap() {

		elemArray := strings.Split(key, "_")
		logrus.Debug(elemArray)

		if len(elemArray) != 2 {
			return "", fmt.Errorf("Agent HEPSUB: key is wrong: %d", len(elemArray))
		}

		for _, v := range value.Search("callid").Data().([]interface{}) {
			dataCallid = append(dataCallid, v)
		}

		hepID, _ := strconv.Atoi(elemArray[0])
		if err := hs.Session.Debug().Table("hepsub_mapping_schema").
			Where("profile = ? AND hepid = ?", elemArray[1], hepID).
			Find(&hepsubObject).Error; err != nil {
			return "", err
		}
		break
	}

	if len(hepsubObject) == 0 {
		logrus.Debug("Agent HEPSUB couldn't find agent mapping")
		return "", nil
	}

	sMapping, _ := gabs.ParseJSON(hepsubObject[0].Mapping)
	if !sMapping.Exists("lookup_profile") || !sMapping.Exists("lookup_field") || !sMapping.Exists("lookup_range") {
		return "", fmt.Errorf("Agent HEPSUB: the hepsub mapping corrupted: lookup_profile, lookup_field, lookup_range - have to be present")
	}

	//lookupProfile := sMapping.Search("lookup_profile").Data().(string)
	lookupField := sMapping.Search("lookup_field").Data().(string)
	lookupRange := sMapping.Search("lookup_range").Data().([]interface{})

	timeFrom := time.Unix(searchObject.Timestamp.From/int64(time.Microsecond), 0)
	timeTo := time.Unix(searchObject.Timestamp.To/int64(time.Microsecond), 0)
	if len(lookupRange) > 0 {
		timeFrom = timeFrom.Add(time.Duration(lookupRange[0].(float64)) * time.Second).UTC()
		timeTo = timeTo.Add(time.Duration(lookupRange[1].(float64)) * time.Second).UTC()
	}

	callIDJson, _ := json.Marshal(dataCallid)

	lookupField = strings.ReplaceAll(lookupField, "$source_field", string(callIDJson))
	lookupField = strings.ReplaceAll(lookupField, "$fromts", fmt.Sprintf("%v", (timeFrom.Unix()*int64(time.Microsecond)+(int64(timeFrom.Nanosecond())/int64(time.Microsecond)))))
	lookupField = strings.ReplaceAll(lookupField, "$tots", fmt.Sprintf("%v", (timeTo.Unix()*int64(time.Microsecond)+(int64(timeTo.Nanosecond())/int64(time.Microsecond)))))

	serverURL := fmt.Sprintf("%s://%s:%d%s/%s", agentObject.Protocol, agentObject.Host, agentObject.Port, agentObject.Path, typeRequest)
	serverNODE := agentObject.Node

	req, err := http.NewRequest("POST", serverURL, bytes.NewBuffer([]byte(lookupField)))

	if err != nil {
		logrus.Error("Couldn't make a request to agent. Query:", serverURL)
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")

	// This one line implements the authentication required for the task.
	//req.SetBasicAuth(ps.User, ps.Password)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		logrus.Error("Agent HEPSUB: Couldn't make http query:", serverURL)
		return "", err
	}
	defer resp.Body.Close()

	buf, _ := ioutil.ReadAll(resp.Body)
	if err != nil {
		logrus.Error("Agent HEPSUB: Couldn't read the data from IO-Buffer")
		return "", err
	}

	responseData, _ := gabs.ParseJSON(buf)
	reply := gabs.New()
	reply.Set("request answer", "message")
	reply.Set(serverNODE, "node")
	reply.Set(agentObject.GUID, "uuid")
	reply.Set(responseData.Data(), "data")
	return reply.String(), nil
}
