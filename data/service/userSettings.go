package service

import (
	"encoding/json"
	"errors"
	"reflect"
	"sort"
	"strconv"
	"strings"

	"github.com/Jeffail/gabs/v2"
	"github.com/sipcapture/homer-app/model"
)

type UserSettingsService struct {
	Service
}

func (ss *UserSettingsService) GetCorrelationMap(data *model.TransactionObject) ([]byte, error) {

	var mappingSchema = model.TableMappingSchema{}
	val := reflect.ValueOf(data.Param.Search)
	profileKey := val.Type().Field(0).Tag.Get("json")
	dataParse := strings.Split(profileKey, "_")
	hepid, _ := strconv.Atoi(dataParse[0])
	profile := dataParse[1]
	ss.Session.Debug().
		Table("mapping_schema").
		Where("hepid = ? and profile = ?", hepid, profile).
		Find(&mappingSchema)

	return mappingSchema.CorrelationMapping, nil
}

func (ss *UserSettingsService) GetAll() (string, error) {
	var userSettings = []model.TableUserSettings{}

	if err := ss.Session.Debug().
		Table("user_settings").
		Find(&userSettings).Error; err != nil {
		return "", errors.New("no users settings found")
	}
	data, _ := json.Marshal(userSettings)
	rows, _ := gabs.ParseJSON(data)
	// sort the array
	vals := rows.Data().([]interface{})
	sort.Slice(vals, func(i, j int) bool {
		return gabs.Wrap(vals[i]).S("username").Data().(string) < gabs.Wrap(vals[j]).S("username").Data().(string)
	})
	count, _ := rows.ArrayCount()
	reply := gabs.New()
	reply.Set(count, "count")
	reply.Set(vals, "data")
	return reply.String(), nil
}
