package service

import (
	"encoding/json"
	"fmt"
	"sort"
	"time"

	"github.com/Jeffail/gabs/v2"
	uuid "github.com/satori/go.uuid"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sirupsen/logrus"
)

type DashBoardService struct {
	ServiceConfig
}

// this method gets all users from database
func (us *DashBoardService) GetDashBoardsLists(username string) (string, error) {
	var userSettings []*model.TableUserSettings
	if err := us.Session.Table("user_settings").Where("category = 'dashboard' AND (username = ? OR (data ->> 'shared' = 'true' OR data ->> 'shared' = '1'))", username).
		Find(&userSettings).Error; err != nil {
		return "", err
	}

	dashboardList := []model.DashBoardElement{}

	for _, usrS := range userSettings {

		dashboardElement := model.DashBoardElement{
			CssClass: "fa",
			Href:     "",
			Id:       "",
			Name:     "undefined",
			Param:    "",
			Owner:    "",
			Shared:   0,
			Type:     0,
			Weight:   10,
		}

		dashboardElement.Owner = usrS.UserName
		dashboardElement.Href = usrS.Param
		dashboardElement.Id = usrS.Param
		dashObject, _ := gabs.ParseJSON(usrS.Data)

		if dashObject.S("name") != nil && dashObject.S("name").Data() != nil {
			dashboardElement.Name = dashObject.S("name").Data().(string)
			dashboardElement.Weight = dashObject.S("weight").Data().(float64)

			if dashObject.S("param") != nil && dashObject.S("param").Data() != nil {
				dashboardElement.Param = dashObject.S("param").Data().(string)
			}

			if dashObject.S("type") != nil && dashObject.S("type").Data() != nil {
				dashboardElement.Type = heputils.CheckIntValue(dashObject.S("type").Data().(float64))
			}

			if dashObject.S("shared") != nil && dashObject.S("shared").Data() != nil {
				if heputils.CheckBoolValue(dashObject.S("data", "shared").Data()) {
					dashboardElement.Shared = 1
				} else {
					dashboardElement.Shared = 0
				}
			}

			dashboardList = append(dashboardList, dashboardElement)
		} else {
			logrus.Error("Dashboard has null in the name....")
		}
	}

	sort.Slice(dashboardList[:], func(i, j int) bool {
		return dashboardList[i].Name < dashboardList[j].Name
	})

	reply := gabs.New()
	reply.Set(len(dashboardList), "total")
	reply.Set(dashboardList, "data")
	reply.Set("ok", "status")
	reply.Set("ok", "auth")

	return reply.String(), nil
}

// this method gets all users from database
func (us *DashBoardService) GetDashBoard(username, param string) (string, error) {
	var userSettings model.TableUserSettings
	if err := us.Session.Table("user_settings").Where("(username = ? OR (data ->> 'shared' = 'true' OR data ->> 'shared' = '1')) AND category = 'dashboard' and param = ? ", username, param).
		Find(&userSettings).Error; err != nil {
		return "", err
	}

	//data, _ := json.Marshal(userSettings)
	data := userSettings.Data
	reply := gabs.New()
	reply.Set(1, "total")
	reply.Set(userSettings.UserName, "owner")
	reply.Set(data, "data")
	reply.Set("ok", "status")
	reply.Set("ok", "auth")

	return reply.String(), nil
}

// this method gets all users from database
func (us *DashBoardService) InsertDashboard(username, dashboardId string, data json.RawMessage) (string, error) {

	newDashboard := model.TableUserSettings{}
	u2 := uuid.NewV4()
	newDashboard.GUID = u2.String()
	newDashboard.Param = dashboardId
	newDashboard.PartId = 10
	newDashboard.UserName = username
	newDashboard.Category = "dashboard"
	newDashboard.CreateDate = time.Now()
	newDashboard.Data = data

	var userSettings model.TableUserSettings
	result := us.Session.Table("user_settings").Where("(username != ? AND category = 'dashboard' and param = ? and partid = ?)", newDashboard.UserName,
		newDashboard.Param, newDashboard.PartId).Find(&userSettings)

	if result.RowsAffected > 0 {
		return "", fmt.Errorf("this is not my dashboard")
	}

	if err := us.Session.Debug().Table("user_settings").Where("username = ? AND category = 'dashboard' and param = ? and partid = ? ", newDashboard.UserName, newDashboard.Param, newDashboard.PartId).
		Delete(&model.TableUserSettings{}).Error; err != nil {
		return "", err
	}

	if err := us.Session.Debug().Table("user_settings").Save(&newDashboard).Error; err != nil {
		return "", err
	}

	reply := gabs.New()
	reply.Set(3, "total")
	reply.Set("ok", "status")
	reply.Set("ok", "auth")

	return reply.String(), nil
}

// this method gets all users from database
func (us *DashBoardService) UpdateDashboard(username, dashboardId string, data json.RawMessage) (string, error) {

	newDashboard := model.TableUserSettings{}
	u2 := uuid.NewV4()
	newDashboard.GUID = u2.String()
	newDashboard.Param = dashboardId
	newDashboard.PartId = 10
	newDashboard.UserName = username
	newDashboard.Category = "dashboard"
	newDashboard.CreateDate = time.Now()
	newDashboard.Data = data

	var userSettings model.TableUserSettings

	result := us.Session.Table("user_settings").Where("(username = ? AND category = 'dashboard' and param = ? and partid = ?)", newDashboard.UserName,
		newDashboard.Param, newDashboard.PartId).Find(&userSettings)

	if result.RowsAffected == 0 || userSettings.UserName != username {
		return "", fmt.Errorf("dashboard doesn't exist")
	}

	if err := us.Session.Debug().Table("user_settings").Update(&newDashboard).Error; err != nil {
		return "", err
	}

	reply := gabs.New()
	reply.Set(3, "total")
	reply.Set("ok", "status")
	reply.Set("ok", "auth")

	return reply.String(), nil
}

// this method gets all users from database
func (us *DashBoardService) DeleteDashboard(username, dashboardId string) (string, error) {
	if err := us.Session.Debug().Table("user_settings").Where("username = ? AND category = 'dashboard' and param = ? and partid = ? ", username, dashboardId, 10).
		Delete(&model.TableUserSettings{}).Error; err != nil {
		return "", err
	}
	reply := gabs.New()
	reply.Set(3, "total")
	reply.Set("ok", "status")
	reply.Set("ok", "auth")
	return reply.String(), nil
}
