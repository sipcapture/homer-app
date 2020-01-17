package service

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/Jeffail/gabs/v2"
	"github.com/sipcapture/homer-app/model"
)

type AdvancedService struct {
	ServiceConfig
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (as *AdvancedService) GetAll() (string, error) {

	var userGlobalSettings = []model.TableGlobalSettings{}
	if err := as.Session.Debug().
		Table("global_settings").
		Find(&userGlobalSettings).Error; err != nil {
		return "", errors.New("no users settings found")
	}

	data, _ := json.Marshal(userGlobalSettings)
	rows, _ := gabs.ParseJSON(data)
	count, _ := rows.ArrayCount()
	reply := gabs.New()
	reply.Set(count, "count")
	reply.Set(rows.Data(), "data")
	return reply.String(), nil
}

// this method gets all the mapping from database
func (as *AdvancedService) GetAdvancedAgainstGUID(guid string) (string, error) {
	var userGlobalSettings = []model.TableGlobalSettings{}
	var count int
	if err := as.Session.Debug().Table("mapping_schema").
		Where("guid = ?", guid).
		Find(&userGlobalSettings).Count(&count).Error; err != nil {
		return "", err
	}
	if len(userGlobalSettings) == 0 {
		return "", fmt.Errorf("data was not found")
	}
	data, _ := json.Marshal(userGlobalSettings)
	response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, string(data))
	return response, nil
}

// this method gets all users from database
func (as *AdvancedService) AddAdvanced(data model.TableGlobalSettings) (string, error) {
	if err := as.Session.Debug().Table("global_settings").
		Create(&data).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully created advanced settings\",\"data\":\"%s\"}", data.GUID)
	return response, nil
}

// this method gets all users from database
func (as *AdvancedService) UpdateAdvancedAgainstGUID(guid string, data model.TableGlobalSettings) (string, error) {
	if err := as.Session.Debug().Table("global_settings").
		Where("guid = ?", guid).
		Update(&data).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully updated global_settings settings\",\"data\":\"%s\"}", guid)
	return response, nil
}

// this method delete the mapping from database
func (as *AdvancedService) DeleteAdvancedAgainstGUID(guid string) (string, error) {
	var advancedObject []*model.TableGlobalSettings
	if err := as.Session.Debug().Table("global_settings").
		Where("guid = ?", guid).
		Delete(&advancedObject).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully deleted global_settings settings\",\"data\":\"%s\"}", guid)
	return response, nil
}
