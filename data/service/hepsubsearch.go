package service

import (
	"encoding/json"
	"fmt"

	"sort"

	"github.com/sipcapture/homer-app/model"
)

type HepsubsearchService struct {
	ServiceConfig
}

// this method gets all users from database
func (hss *HepsubsearchService) GetAgentsub() (string, error) {
	var AgentsubObject []model.TableAgentLocationSession
	var count int
	if err := hss.Session.Debug().Table("agent_location_session").
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
func (hss *HepsubsearchService) DoHepSubSearch(data model.SearchObject) (string, error) {
	response := fmt.Sprintf("{\"message\":\"successfully created DoHepSubSearch\",\"data\":\"empty\"}")
	return response, nil
}
