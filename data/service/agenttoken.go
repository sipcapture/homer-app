package service

import (
	"encoding/json"
	"fmt"

	"sort"

	"github.com/Jeffail/gabs/v2"
	"github.com/sipcapture/homer-app/model"
	"github.com/sirupsen/logrus"
)

type AuthtokenService struct {
	ServiceConfig
}

// this method gets all users from database
func (hs *AuthtokenService) GetAuthtokenAgainstGUID(guid string) (string, error) {
	var AuthtokenObject []model.TableAuthToken
	var count int
	if err := hs.Session.Debug().Table("auth_token").
		Where("guid = ?", guid).
		Find(&AuthtokenObject).Count(&count).Error; err != nil {
		return "", err
	}
	if len(AuthtokenObject) == 0 {
		return "", fmt.Errorf("no advacned settings found for guid %s", guid)
	}
	sort.Slice(AuthtokenObject[:], func(i, j int) bool {
		return AuthtokenObject[i].GUID < AuthtokenObject[j].GUID
	})

	data, _ := json.Marshal(AuthtokenObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":\"%s\"}", count, string(data))
	return response, nil
}

// this method gets all users from database
func (hs *AuthtokenService) GetAuthtoken() (string, error) {
	var AuthtokenObject []model.TableAuthToken
	var count int
	if err := hs.Session.Debug().Table("auth_token").
		Find(&AuthtokenObject).Count(&count).Error; err != nil {
		return "", err
	}
	sort.Slice(AuthtokenObject[:], func(i, j int) bool {
		return AuthtokenObject[i].GUID < AuthtokenObject[j].GUID
	})

	data, _ := json.Marshal(AuthtokenObject)
	response := fmt.Sprintf("{\"count\":%d,\"data\":%s}", count, string(data))
	return response, nil
}

// this method gets all users from database
func (hs *AuthtokenService) AddAuthtoken(data model.TableAuthToken) (string, error) {
	if err := hs.Session.Debug().Table("auth_token").
		Create(&data).Error; err != nil {
		return "", err
	}

	dataReply := gabs.New()
	dataReply.Set(data.Token, "token")
	reply := gabs.New()
	reply.Set("successfully created auth token", "message")
	reply.Set(dataReply.Data(), "data")

	return reply.String(), nil
}

// this method gets all users from database
func (hs *AuthtokenService) UpdateAuthtokenAgainstGUID(guid string, data model.TableAuthToken) (string, error) {
	if err := hs.Session.Debug().Table("auth_token").
		Where("guid = ?", guid).
		Update(&data).Error; err != nil {
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully updated auth token settings\",\"data\":\"%s\"}", guid)
	return response, nil
}

// this method gets all users from database
func (hs *AuthtokenService) DeleteAuthtokenAgainstGUID(guid string) (string, error) {
	var AuthtokenObject []model.TableAuthToken
	if err := hs.Session.Debug().Table("auth_token").
		Where("guid = ?", guid).
		Delete(&AuthtokenObject).Error; err != nil {
		logrus.Println(err.Error())
		return "", err
	}
	response := fmt.Sprintf("{\"message\":\"successfully deleted authtoken\",\"data\":\"%s\"}", guid)
	return response, nil
}
