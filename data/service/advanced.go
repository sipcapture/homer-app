package service

import (
	"encoding/json"
	"errors"

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
