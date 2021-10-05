package service

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/Jeffail/gabs/v2"
	"github.com/sipcapture/homer-app/model"
)

type MappingService struct {
	ServiceConfig
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

func (mps *MappingService) UpdateMappingAgainstGUID(guid string, data model.TableMappingSchema) (string, error) {
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

// this method gets all the mapping from database
func (mps *MappingService) GetSmartSuggestionAginstProfile(hepid string, profile string) (string, error) {

	var mappingObject model.TableMappingSchema
	if err := mps.Session.Debug().Table("mapping_schema").
		Where("hepid = ? and profile = ?", hepid, profile).
		Take(&mappingObject).Error; err != nil {
		return "", err
	}
	if mappingObject.MappingSettings == nil {
		return "", fmt.Errorf("data was not found")
	}

	sData, _ := gabs.ParseJSON(mappingObject.FieldsMapping)
	dataObject := gabs.New()

	for _, v := range sData.Children() {

		if !v.Exists("form_type") || !v.Exists("skip") || !v.Exists("hide") || !v.Exists("name") || !v.Exists("id") {
			continue
		}

		formTypeField := v.Search("form_type").Data().(string)
		idField := v.Search("id").Data().(string)
		skipField := v.Search("skip").Data().(bool)

		if formTypeField == "multiselect" || formTypeField == "smart-input" || skipField == true {
			continue
		}
		dataElement := gabs.New()
		valueField := idField

		if strings.HasPrefix(idField, "protocol_header.") {
			valueField = strings.Replace(idField, "protocol_header.", "net.", -1)
		}

		if hepid == "1" {
			if strings.HasPrefix(idField, "data_header.") {
				valueField = strings.Replace(idField, "data_header.", "sip.", -1)
			}
			dataElement.Set(idField, "value")
			dataElement.Set(valueField, "name")
		} else {
			dataElement.Set(idField, "value")
			dataElement.Set(idField, "name")
		}

		dataObject.ArrayAppend(dataElement.Data(), "data")
	}

	dataReply := gabs.New()
	dataReply.Set(dataObject.Data(), "data")

	return dataReply.String(), nil
}
