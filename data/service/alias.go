package service

import (
	"net"
	"net/netip"
	"strconv"
	"time"

	"github.com/Jeffail/gabs/v2"
	"github.com/gaissmai/cidrtree"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sipcapture/homer-app/utils/logger"
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

func (as *AliasService) GetAllActiveAsMap() (*AliasMap, error) {
	rows, err := as.GetAllActive()
	if err != nil {
		return nil, err
	}

	return NewAliasMap(rows), nil
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

type Alias struct {
	Name      string
	Port      int
	CaptureID string
}

type AliasMap struct {
	table *cidrtree.Table[*[]Alias]
}

func NewAliasMap(rows []model.TableAlias) *AliasMap {
	var table cidrtree.Table[*[]Alias]
	m := make(map[netip.Prefix]*[]Alias)
	for _, row := range rows {
		cidr := row.IP + "/" + strconv.Itoa(*row.Mask)
		prefix, err := netip.ParsePrefix(cidr)
		if err != nil {
			logger.Error("ParsePrefix alias CIDR: ["+cidr+"] error: ", err.Error())
			continue
		}

		alias := Alias{
			Name:      row.Alias,
			Port:      *row.Port,
			CaptureID: row.CaptureID,
		}

		if as, ok := m[prefix]; ok {
			*as = append(*as, alias)
		} else {
			as = &[]Alias{alias}
			m[prefix] = as
			table.Insert(prefix, as)
		}
	}

	return &AliasMap{table: &table}
}

// Find finds an alias in the map based on the IP, port and capture ID provided.
// Performs a longest prefix match based on the IP address.
func (m *AliasMap) Find(ip net.IP, port int, captureID *string) (string, bool) {
	addr, ok := netip.AddrFromSlice(ip)
	if !ok {
		return "", false
	}

	_, as, ok := m.table.Lookup(addr.Unmap())
	if !ok {
		return "", false
	}

	for _, a := range *as {
		if a.Port == port && (captureID == nil || a.CaptureID == *captureID) {
			return a.Name, true
		}
	}

	return "", false
}
