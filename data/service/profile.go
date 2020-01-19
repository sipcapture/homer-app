package service

import (
	"encoding/json"
	"fmt"

	"github.com/sipcapture/homer-app/model"
)

type ProfileService struct {
	ServiceConfig
	DatabaseNodeMap *[]model.DatabasesMap
}

// this method gets all users from database
func (ps *ProfileService) GetProfile() (string, error) {
	var hepsubObject []*model.TableHepsubSchema
	var count int
	if err := ps.Session.Debug().Table("hepsub_mapping_schema").Where("partid = ?", 10).
		Find(&hepsubObject).Count(&count).Error; err != nil {
		return "", err
	}
	data, _ := json.Marshal(hepsubObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, string(data))
	return response, nil
}

// this method gets all users from database
func (ps *ProfileService) GetDashboardList() (string, error) {
	var hepsubObject []*model.TableHepsubSchema
	var count int
	if err := ps.Session.Debug().Table("user_settings").
		Find(&hepsubObject).Count(&count).Error; err != nil {
		return "", err
	}
	data, _ := json.Marshal(hepsubObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, string(data))
	return response, nil
}

// this method gets all users from database
func (ps *ProfileService) GetDBNodeList() (string, error) {
	var count = 0
	data, _ := json.Marshal(ps.DatabaseNodeMap)
	count = len(*ps.DatabaseNodeMap)
	response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, string(data))
	return response, nil
}
