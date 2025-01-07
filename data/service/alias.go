package service

import (
	"time"

	"github.com/Jeffail/gabs/v2"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/heputils"
)

type AliasService struct {
	ServiceConfig
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (as *AliasService) GetAll() ([]model.TableAlias, error) {

	alias := []model.TableAlias{}
	if err := as.Session.Debug().
		Table("alias").
		Find(&alias).Error; err != nil {
		return alias, err
	}
	return alias, nil
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (as *AliasService) GetAllActive() ([]model.TableAlias, error) {

	alias := []model.TableAlias{}
	if err := as.Session.Debug().
		Table("alias").
		Where("status = true").
		Find(&alias).Error; err != nil {
		return alias, err
	}
	return alias, nil
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (as *AliasService) Add(alias *model.TableAlias) (string, error) {
	alias.GUID = heputils.GenereateNewUUID()
	alias.CreateDate = time.Now()
	if err := as.Session.Debug().
		Table("alias").
		Create(&alias).Error; err != nil {
		return "", err
	}
	reply := gabs.New()
	reply.Set(alias.GUID, "data")
	reply.Set("successfully created alias", "message")
	return reply.String(), nil
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (as *AliasService) Get(alias *model.TableAlias) (model.TableAlias, error) {
	data := model.TableAlias{}
	if err := as.Session.Debug().
		Table("alias").
		Where("guid = ?", alias.GUID).Find(&data).Error; err != nil {
		return data, err
	}
	return data, nil
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (as *AliasService) Delete(alias *model.TableAlias) error {
	if err := as.Session.Debug().
		Table("alias").
		Where("guid = ?", alias.GUID).Delete(model.TableAlias{}).Error; err != nil {
		return err
	}
	return nil
}

// this method create new user in the database
// it doesn't check internally whether all the validation are applied or not
func (as *AliasService) Update(alias *model.TableAlias) error {
	if err := as.Session.Debug().
		Table("alias").
		Debug().
		Model(&model.TableAlias{}).
		Where("guid = ?", alias.GUID).Update(alias).Error; err != nil {
		return err
	}
	return nil
}
