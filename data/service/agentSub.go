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
	"github.com/sipcapture/homer-app/config"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/exportwriter"
	"github.com/sipcapture/homer-app/utils/logger"
)

type AgentsubService struct {
	ServiceConfig
}

// GetAgentsub gets all active HEPSUB agent sessions from database
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
	reply.Set("successfully retrieved agent records", "message")
	reply.Set(dataElement.Data(), "data")
	return reply.String(), nil
}

// GetAgentsubAgainstGUID gets a specific active HEPSUB agent session from database identified by GUID
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

// GetAgentsubAgainstType gets all active HEPSUB agent sessions from database for a given type (pattern matched)
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

// GetAgentsubAgainstGUIDAndType gets an active HEPSUB agent session by GUID for a given type (pattern matched)
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

// GetAuthKeyByHeaderToken gets user auth tokens from database
func (hs *AgentsubService) GetAuthKeyByHeaderToken(token string) (string, error) {
	var tokenObject model.TableAuthToken
	var count int
	if err := hs.Session.Debug().Table("auth_token").
		Where("expire_date > NOW() AND active = true AND token = ? ", token).
		Find(&tokenObject).Count(&count).Error; err != nil {
		return "", err
	}
	if count == 0 {
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

// AddAgentsub creates a new HEPSUB agent session
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

// UpdateAgentsubAgainstGUID updates an existing HEPSUB agent session
func (hs *AgentsubService) UpdateAgentsubAgainstGUID(guid string, data model.TableAgentLocationSession) (string, error) {
	if err := hs.Session.Debug().Table("agent_location_session").
		Where("guid = ?", guid).
		Update(&data).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully updated agent record\",\"data\":\"%s\"}", guid)
	return response, nil
}

// DeleteAgentsubAgainstGUID removes an existing HEPSUB agent session
func (hs *AgentsubService) DeleteAgentsubAgainstGUID(guid string) (string, error) {
	var AgentsubObject []model.TableAgentLocationSession
	if err := hs.Session.Debug().Table("agent_location_session").
		Where("guid = ? OR expire_date < NOW()", guid).
		Delete(&AgentsubObject).Error; err != nil {
		logger.Debug(err.Error())
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully deleted agent record\",\"data\":\"%s\"}", guid)
	return response, nil
}

// DoSearchByPost loads the subscriber mappings from the database and builds a HEPSUB search query using request data
func (hs *AgentsubService) DoSearchByPost(agentObject model.TableAgentLocationSession, searchObject model.SearchObject, typeRequest string) ([]byte, error) {

	var lookupField string
	var hepsubObject []model.TableHepsubSchema
	Data, _ := json.Marshal(searchObject.Param.Search)
	sData, _ := gabs.ParseJSON(Data)
	dataPost := gabs.New()

	// process the search request(s), arriving "[hepid]_[type]" i.e. "1_call"
	for key := range sData.ChildrenMap() {
		elemArray := strings.Split(key, "_")
		if len(elemArray) != 2 {
			return nil, fmt.Errorf("Agent HEPSUB: key is wrong: %d", len(elemArray))
		}

		hepID, _ := strconv.Atoi(elemArray[0])
		if err := hs.Session.Debug().Table("hepsub_mapping_schema").
			Where("profile = ? AND hepid = ?", elemArray[1], hepID).
			Find(&hepsubObject).Error; err != nil {
			return nil, err
		}
		break
	}

	if len(hepsubObject) == 0 {
		logger.Debug("Agent HEPSUB couldn't find agent mapping")
		return nil, fmt.Errorf("agent HEPSUB couldn't find agent mapping")
	}

	sMapping, _ := gabs.ParseJSON(hepsubObject[0].Mapping)
	if !sMapping.Exists("lookup_profile") || (!sMapping.Exists("lookup_field") && !sMapping.Exists("lookup_fields")) || !sMapping.Exists("lookup_range") {
		return nil, fmt.Errorf("agent HEPSUB: the hepsub mapping corrupted: lookup_profile, lookup_field, lookup_range - have to be present")
	}

	lookupFields := sMapping.Search("source_fields")

	for _, value := range sData.ChildrenMap() {
		if lookupFields != nil {
			for k := range lookupFields.ChildrenMap() {
				dataV := value.Search(k).Data().([]interface{})
				dataPost.Set(dataV, k)
			}
		} else {
			dataV := value.Search("callid").Data()
			dataPost.Set(dataV, "callid")
		}
		break
	}

	//lookupProfile := sMapping.Search("lookup_profile").Data().(string)
	lookupField = sMapping.Search("lookup_field").Data().(string)
	lookupRange := sMapping.Search("lookup_range").Data().([]interface{})

	timeFrom := time.Unix(searchObject.Timestamp.From/int64(time.Microsecond), 0)
	timeTo := time.Unix(searchObject.Timestamp.To/int64(time.Microsecond), 0)
	if len(lookupRange) > 0 {
		timeFrom = timeFrom.Add(time.Duration(lookupRange[0].(float64)) * time.Second).UTC()
		timeTo = timeTo.Add(time.Duration(lookupRange[1].(float64)) * time.Second).UTC()
	}

	lookupField = strings.ReplaceAll(lookupField, "$source_field", dataPost.String())
	lookupField = strings.ReplaceAll(lookupField, "$fromts", fmt.Sprintf("%v", timeFrom.Unix()*int64(time.Microsecond)+(int64(timeFrom.Nanosecond())/int64(time.Microsecond))))
	lookupField = strings.ReplaceAll(lookupField, "$tots", fmt.Sprintf("%v", timeTo.Unix()*int64(time.Microsecond)+(int64(timeTo.Nanosecond())/int64(time.Microsecond))))

	serverURL := fmt.Sprintf("%s://%s:%d%s/%s", agentObject.Protocol, agentObject.Host, agentObject.Port, agentObject.Path, typeRequest)
	serverNODE := agentObject.Node

	req, err := http.NewRequest("POST", serverURL, bytes.NewBuffer([]byte(lookupField)))

	if err != nil {
		logger.Error("Couldn't make a request to agent. Query: ", serverURL)
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	// This one line implements the authentication required for the task.
	//req.SetBasicAuth(ps.User, ps.Password)
	defer config.Setting.MAIN_SETTINGS.SubscribeHttpClient.CloseIdleConnections()
	resp, err := config.Setting.MAIN_SETTINGS.SubscribeHttpClient.Do(req)
	if err != nil {
		logger.Error("Agent HEPSUB: Couldn't make http query:", serverURL)
		return nil, err
	}
	defer resp.Body.Close()

	buf, _ := ioutil.ReadAll(resp.Body)
	if err != nil {
		logger.Error("Agent HEPSUB: Couldn't read the data from IO-Buffer")
		return nil, err
	}

	// when downloading the file, return only the file data
	if typeRequest == "download" {
		var buffer bytes.Buffer
		export := exportwriter.NewWriter(buffer)
		_, err := export.Buffer.Write(buf)
		if err != nil {
			logger.Error("write error to the download buffer", err)
		}
		return export.Buffer.Bytes(), nil
	}

	// respond to lookup requests
	responseData, _ := gabs.ParseJSON(buf)
	reply := gabs.New()
	reply.Set("request answer", "message")
	reply.Set(serverNODE, "node")
	reply.Set(agentObject.GUID, "uuid")
	reply.Set(responseData.Data(), "data")
	return reply.Bytes(), nil
}
