package service

import (
	"encoding/json"
	"fmt"

	"sort"

	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/logger"
)

type HepsubService struct {
	ServiceConfig
}

// this method gets all users from database
func (hs *HepsubService) GetHepSubAgainstGUID(guid string) (string, error) {
	var hepsubObject []model.TableHepsubSchema
	var count int
	if err := hs.Session.Debug().Table("hepsub_mapping_schema").
		Where("guid = ?", guid).
		Find(&hepsubObject).Count(&count).Error; err != nil {
		return "", err
	}
	if len(hepsubObject) == 0 {
		return "", fmt.Errorf("no hepsub object found for guid [%s]", guid)
	}
	sort.Slice(hepsubObject[:], func(i, j int) bool {
		return hepsubObject[i].GUID < hepsubObject[j].GUID
	})
	data, _ := json.Marshal(hepsubObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":\"%s\"}", count, string(data))
	return response, nil
}

// this method gets all users from database
func (hs *HepsubService) GetHepSub() (string, error) {
	var hepsubObject []model.TableHepsubSchema
	var count int
	if err := hs.Session.Debug().Table("hepsub_mapping_schema").
		Find(&hepsubObject).Count(&count).Error; err != nil {
		return "", err
	}
	sort.Slice(hepsubObject[:], func(i, j int) bool {
		return hepsubObject[i].GUID < hepsubObject[j].GUID
	})
	data, _ := json.Marshal(hepsubObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, string(data))
	return response, nil
}

// this method gets all users from database
func (hs *HepsubService) GetHepSubFields(id, transaction string) (string, error) {
	var hepsubObject []model.TableHepsubSchema
	var count int
	if err := hs.Session.Debug().Table("hepsub_mapping_schema").
		Where("hepid = ? and profile = ?", id, transaction).
		Find(&hepsubObject).Count(&count).Error; err != nil {
		return "", err
	}
	data, _ := json.Marshal(hepsubObject)
	responseMap := map[string]interface{}{
		"count": count,
		"data":  json.RawMessage(data),
	}
	response, _ := json.Marshal(responseMap)
	return string(response), nil
}

// this method gets all users from database
func (hs *HepsubService) AddHepSub(data model.TableHepsubSchema) (string, error) {
	if err := hs.Session.Debug().Table("hepsub_mapping_schema").
		Create(&data).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully created hepsub settings\",\"data\":\"%s\"}", data.GUID)
	return response, nil
}

// this method gets all users from database
func (hs *HepsubService) UpdateHepSubAgainstGUID(guid string, data model.TableHepsubSchema) (string, error) {
	if err := hs.Session.Debug().Table("hepsub_mapping_schema").
		Where("guid = ?", guid).
		Update(&data).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully updated hepsub settings\",\"data\":\"%s\"}", guid)
	return response, nil
}

// this method gets all users from database
func (hs *HepsubService) DeleteHepSubAgainstGUID(guid string) (string, error) {
	var hepsubObject []model.TableHepsubSchema
	if err := hs.Session.Debug().Table("hepsub_mapping_schema").
		Where("guid = ?", guid).
		Delete(&hepsubObject).Error; err != nil {
		logger.Debug(err.Error())
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully deleted hepsub settings\",\"data\":\"%s\"}", guid)
	return response, nil
}
