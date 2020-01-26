package service

import (
	"encoding/json"
	"fmt"

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
	data, _ := json.Marshal(AgentsubObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":\"%s\"}", count, string(data))
	return response, nil
}

// this method gets all users from database
func (hs *AgentsubService) GetAgentsubAgainstType(typeRequest string) (string, error) {
	var AgentsubObject []model.TableAgentLocationSession
	var count int
	whereSql := fmt.Sprintf("expire_date < NOW() AND type LIKE '%%%s%%'", typeRequest)
	if err := hs.Session.Debug().Table("agent_location_session").
		Where(whereSql).
		Find(&AgentsubObject).Count(&count).Error; err != nil {
		return "", err
	}
	if len(AgentsubObject) == 0 {
		return "", fmt.Errorf("no advacned settings found for type %s", typeRequest)
	}
	sort.Slice(AgentsubObject[:], func(i, j int) bool {
		return AgentsubObject[i].GUID < AgentsubObject[j].GUID
	})
	data, _ := json.Marshal(AgentsubObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":\"%s\"}", count, string(data))
	return response, nil
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

	data, _ := json.Marshal(tokenObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":\"%s\"}", count, string(data))
	return response, nil
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
	data, _ := json.Marshal(AgentsubObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, string(data))
	return response, nil
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
