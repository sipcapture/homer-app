package service

import (
	"fmt"
	"time"

	"github.com/Jeffail/gabs/v2"
	uuid "github.com/satori/go.uuid"
	"gitlab.com/qxip/webapp-go/model"
)

type AliasService struct {
	Service
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
func (as *AliasService) Add(alias *model.TableAlias) (string, error) {
	u1 := uuid.NewV4()
	alias.GUID = u1.String()
	alias.CreateDate = time.Now()
	if err := as.Session.Debug().
		Table("alias").
		Create(&alias).Error; err != nil {
		return "", err
	}
	reply := gabs.New()
	reply.Set(u1.String(), "data")
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
	fmt.Println(alias)
	if err := as.Session.Debug().
		Table("alias").
		Debug().
		Model(&model.TableAlias{}).
		Where("guid = ?", alias.GUID).Update(alias).Error; err != nil {
		return err
	}
	return nil
}
