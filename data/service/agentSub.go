package service

import (
	"encoding/json"
	"fmt"
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
		return "", fmt.Errorf("no advacned settings found for guid %s", guid)
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
		return "", fmt.Errorf("no advacned settings found for type %s", typeRequest)
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
	var tokenObject []model.TableAuthToken
	var count int
	if err := hs.Session.Debug().Table("auth_token").
		Where("expire_date > NOW() AND active = true AND token = ? ", token).
		Find(&tokenObject).Count(&count).Error; err != nil {
		return "", err
	}
	if len(tokenObject) == 0 {
		return "", fmt.Errorf("no auth_token found or it has been expired: [%s]", token)
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
func (hs *AgentsubService) DoSearchByPost(agentObject model.TableAgentLocationSession, searchObject model.SearchObject) (string, error) {

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
			return "", fmt.Errorf("key is wrong: %d", len(elemArray))
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
		return "", fmt.Errorf("no mapping found")
	}

	sMapping, _ := gabs.ParseJSON(hepsubObject[0].Mapping)
	if !sMapping.Exists("lookup_profile") || !sMapping.Exists("lookup_field") || !sMapping.Exists("lookup_range") {
		return "", fmt.Errorf("no mapping corrupted: lookup_profile, lookup_field, lookup_range - have to be present")
	}

	lookupProfile := sMapping.Search("lookup_profile").Data().(string)
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

	fmt.Println("lookupField", lookupField)
	fmt.Println("lookupProfile", lookupProfile)

	//data, _ := json.Marshal(hepsubObject)
	reply := gabs.New()
	reply.Set("request answer", "message")
	reply.Set("data", "data")
	return reply.String(), nil
}
