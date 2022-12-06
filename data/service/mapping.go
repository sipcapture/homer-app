package service

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

	"github.com/Jeffail/gabs/v2"
	"github.com/sipcapture/homer-app/migration"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/logger"
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
func (mps *MappingService) GetSmartSuggestionAginstProfile(hepid string, profile string, queryString string) (string, error) {

	var mappingObject model.TableMappingSchema
	if err := mps.Session.Debug().Table("mapping_schema").
		Where("hepid = ? and profile = ?", hepid, profile).
		Take(&mappingObject).Error; err != nil {
		return "", err
	}
	if mappingObject.MappingSettings == nil {

		logger.Error("data was not found for : ", hepid, profile)
		return "", fmt.Errorf("data was not found")
	}

	preParsed := ""

	q, err := url.ParseQuery(queryString)
	if err == nil {
		queryData := q.Get("query")
		if queryData != "" {
			jsQuery, err := gabs.ParseJSON([]byte(queryData))
			if err == nil {
				if jsQuery.Exists("data") {
					dataReq := jsQuery.Search("data").Data().(string)
					if dataReq != "" {
						words := strings.Fields(dataReq)
						logger.Debug("WORDS: ", words)
						if len(words) > 0 {
							preParsed = words[len(words)-1]
						}
					}
				}
			}
		}
	}

	sData, _ := gabs.ParseJSON(mappingObject.FieldsMapping)
	dataObject := gabs.New()

	//logger.Debug("Mapping data : ", mappingObject.FieldsMapping)

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

		// if not our, skip it
		if preParsed != "" && !strings.Contains(valueField, preParsed) {
			continue
		}

		dataObject.ArrayAppend(dataElement.Data(), "data")
	}

	dataReply := gabs.New()
	dataReply.Set(dataObject.Data(), "data")

	return dataReply.String(), nil
}

// this method gets all the mapping from database
func (mps *MappingService) RecreateMapping() error {

	mappingSchema := migration.GetMappingSchemas()

	tableName := "mapping_schema"

	/* globalSettingData data */
	logger.Debug("reinstalling " + tableName)

	mps.Session.Exec("TRUNCATE TABLE " + tableName)
	for _, el := range mappingSchema {
		db := mps.Session.Save(&el)
		if db != nil && db.Error != nil {
			logger.Error(fmt.Sprintf("RecreateMapping: Save failed for table [%s]: with error %s. HEPID:[%d], Profile:[%s]", tableName, db.Error, el.Hepid, el.Profile))
		} else {
			logger.Debug(fmt.Sprintf("RecreateMapping: Save for table [%s] was success. HEPID:[%d], Profile:[%s]", tableName, el.Hepid, el.Profile))
		}
	}

	return nil
}

// this method gets all the mapping from database
func (mps *MappingService) RecreateMappingByUUID(guid string) error {

	var mappingObject []*model.TableMappingSchema
	var count int
	if err := mps.Session.Debug().Table("mapping_schema").
		Where("guid = ?", guid).
		Find(&mappingObject).Count(&count).Error; err != nil {
		return err
	}
	if len(mappingObject) == 0 {
		return fmt.Errorf("data was not found")
	}

	mappingSchema := migration.GetMappingSchemas()

	for _, el := range mappingSchema {

		if el.Hepid == mappingObject[0].Hepid && el.HepAlias == mappingObject[0].HepAlias && el.Profile == mappingObject[0].Profile {

			if err := mps.Session.Debug().Table("mapping_schema").
				Where("guid = ?", guid).
				Delete(&mappingObject).Error; err != nil {
				return err
			}

			db := mps.Session.Save(&el)
			if db != nil && db.Error != nil {
				logger.Error(fmt.Sprintf("RecreateMappingByUUID: Save failed for table mapping_schema: with error %s. HEPID:[%d], Profile:[%s]", db.Error, el.Hepid, el.Profile))
			} else {
				logger.Debug(fmt.Sprintf("RecreateMappingByUUID: Save for table mapping_schema was success. HEPID:[%d], Profile:[%s]", el.Hepid, el.Profile))
			}

			return nil
		}
	}

	return fmt.Errorf("couldn't find this profile in the default mapping")
}
