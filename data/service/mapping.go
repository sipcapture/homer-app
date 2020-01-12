package service

import (
	"encoding/json"
	"fmt"

	"gitlab.com/qxip/webapp-go/model"
)

type MappingService struct {
	Service
}

// this method gets all users from database
func (mps *MappingService) GetMapping() (string, error) {
	var mappingObject []*model.TableMappingSchema
	var count int
	if err := mps.Session.Debug().Table("mapping_schema").Where("partid = ?", 10).
		Find(&mappingObject).Count(&count).Error; err != nil {
		return "", err
	}
	if len(mappingObject) == 0 {
		return "", fmt.Errorf("data was not found")
	}
	data, _ := json.Marshal(mappingObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, string(data))
	return response, nil
}

// this method gets all users from database
func (hs *MappingService) AddMapping(data model.TableMappingSchema) (string, error) {
	if err := hs.Session.Debug().Table("mapping_schema").
		Create(&data).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully created mappings settings\",\"data\":\"%s\"}", data.GUID)
	return response, nil
}

// this method gets all the mapping from database
func (mps *MappingService) GetMappingFields(id, transaction string) (string, error) {
	var mappingObject []*model.TableMappingSchema
	var count int
	if err := mps.Session.Debug().Table("mapping_schema").
		Where("hepid = ? and profile = ?", id, transaction).
		Find(&mappingObject).Count(&count).Error; err != nil {
		return "", err
	}
	if len(mappingObject) == 0 {
		return "", fmt.Errorf("data was not found")
	}
	data, _ := json.Marshal(mappingObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, string(data))
	return response, nil
}

// this method gets all the mapping from database
func (mps *MappingService) GetMappingAgainstGUID(guid string) (string, error) {
	var mappingObject []*model.TableMappingSchema
	var count int
	if err := mps.Session.Debug().Table("mapping_schema").
		Where("guid = ?", guid).
		Find(&mappingObject).Count(&count).Error; err != nil {
		return "", err
	}
	if len(mappingObject) == 0 {
		return "", fmt.Errorf("data was not found")
	}
	data, _ := json.Marshal(mappingObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, string(data))
	return response, nil
}

func (mps *MappingService) UpdateMappingAgainstGUID(guid string, data model.TableHepsubSchema) (string, error) {
	if err := mps.Session.Debug().Table("mapping_schema").
		Where("guid = ?", guid).
		Update(&data).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully updated hepsub settings\",\"data\":\"%s\"}", guid)
	return response, nil
}

// this method gets all the mapping from database
func (mps *MappingService) DeleteMappingAgainstGUID(guid string) (string, error) {
	var mappingObject []*model.TableMappingSchema
	if err := mps.Session.Debug().Table("mapping_schema").
		Where("guid = ?", guid).
		Delete(&mappingObject).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully deleted mapping settings\",\"data\":\"%s\"}", guid)
	return response, nil
}
