package service

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Jeffail/gabs/v2"
	uuid "github.com/satori/go.uuid"
	"gitlab.com/qxip/webapp-go/model"
)

type DashBoardService struct {
	Service
}

// this method gets all users from database
func (us *DashBoardService) GetDashBoardsLists(username string) (string, error) {
	var userSettings []*model.TableUserSettings
	if err := us.Session.Debug().Table("user_settings").Where("username = ? AND category = 'dashboard'", username).
		Find(&userSettings).Error; err != nil {
		return "", err
	}
	data, _ := json.Marshal(userSettings)
	fmt.Println(string(data))
	dashboardElement := model.DashBoardElement{
		CssClass: "fa",
		Href:     "",
		Id:       "",
		Name:     "undefined",
		Param:    "",
		Shared:   0,
		Type:     0,
		Weight:   10,
	}
	rows, _ := gabs.ParseJSON(data)
	dashboardList := []model.DashBoardElement{}
	count := 0
	for _, row := range rows.Children() {
		count++
		fmt.Println(row)
		if row.Exists("param") {
			dashboardElement.Href = row.S("param").Data().(string)
			dashboardElement.Id = row.S("param").Data().(string)
		}
		if row.Exists("data") {
			dashboardElement.Name = row.S("data", "name").Data().(string)
			dashboardElement.Weight = row.S("data", "weight").Data().(float64)
		}
		fmt.Println(dashboardElement)
		dashboardList = append(dashboardList, dashboardElement)
	}
	reply := gabs.New()
	reply.Set(count, "total")
	reply.Set(dashboardList, "data")
	reply.Set("ok", "status")
	reply.Set("ok", "auth")

	return reply.String(), nil
}

// this method gets all users from database
func (us *DashBoardService) GetDashBoard(username, param string) (string, error) {
	var userSettings model.TableUserSettings
	if err := us.Session.Debug().Table("user_settings").Where("username = ? AND category = 'dashboard' and param = ? ", username, param).
		Find(&userSettings).Error; err != nil {
		return "", err
	}

	//data, _ := json.Marshal(userSettings)
	data := userSettings.Data
	reply := gabs.New()
	reply.Set(1, "total")
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
