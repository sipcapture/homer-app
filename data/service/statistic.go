package service

import (
	"fmt"

	"github.com/Jeffail/gabs"
	client "github.com/influxdata/influxdb1-client/v2"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/logger"
)

// StatisticService : here you tell us what Salutation is
type StatisticService struct {
	ServiceInfluxDB
}

// StatisticData: this method create new user in the database
func (ss *StatisticService) StatisticData(statisticObject *model.StatisticObject) (string, error) {
	/* table := "hep_proto_1_default"
	sLimit := statisticObject.Param.Limit
	count := 0
	searchData := []model.HepTable{}
	searchFromTime := time.Unix(statisticObject.Timestamp.From/int64(time.Microsecond), 0)
	searchToTime := time.Unix(statisticObject.Timestamp.To/int64(time.Microsecond), 0)
	//Data, _ := json.Marshal(statisticObject.Param.Query)
	//sData, _ := gabs.ParseJSON(Data)

	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr: "http://localhost:8086",
	})
	if err != nil {
		fmt.Println("Error creating InfluxDB Client: ", err.Error())
	}
	defer c.Close()

	q := client.NewQuery("SELECT count(value) FROM cpu_load", "mydb", "")
	if response, err := c.Query(q); err == nil && response.Error() == nil {
		fmt.Println(response.Results)
	Data, _ := json.Marshal(statisticObject.Param.Query)
	sData, _ := gabs.ParseJSON(Data)
	*/

	diff := (statisticObject.Timestamp.To - statisticObject.Timestamp.From) / 1000 / 60 / 60
	indexRange := "60s"
	if diff <= 2 {
		indexRange = "60s"
	} else if diff >= 2 && diff <= 8 {
		indexRange = "300s"
	} else if diff >= 8 && diff <= 50 {
		indexRange = "3600s"
	} else {
		indexRange = "86400s"
	}

	var infQuery client.Query
	for index, query := range statisticObject.Param.Query {
		logger.Debug("inside of the array", index)
		logger.Debug(query.Main)

		builtQuery, err := buildStatisticDataQuery(
			query.Database,
			query.Retention,
			query.Main,
			query.Type,
			statisticObject.Timestamp.From*1000000,
			statisticObject.Timestamp.To*1000000,
			int64(statisticObject.Param.Limit),
			indexRange,
		)
		if err != nil {
			logger.Error("Rejected statistic query parameters: ", err)
			return "", err
		}
		infQuery = builtQuery
		logger.Debug(infQuery.Command)
	}

	q := infQuery
	reply := gabs.New()
	dataEmpty := []string{}

	if response, err := ss.InfluxClient.Query(q); err == nil && response.Error() == nil {

		if len(response.Results[0].Series) != 1 {
			fmt.Printf("Expected 1 series in result, got %d", len(response.Results[0].Series))
		}

		reply.Set(len(response.Results), "total")
		reply.Set("ok", "status")
		reply.Set(response, "data")
		return reply.String(), nil
	} else {
		reply.Set("ok", "status")
		reply.Set(0, "total")
		reply.Set(dataEmpty, "data")
		return reply.String(), nil
	}
}

// StatisticData: this method create new user in the database
func (ss *StatisticService) StatisticDataBaseList() (string, error) {

	infQuery := fmt.Sprintf("SHOW DATABASES")

	logger.Debug(infQuery)

	q := client.NewQuery(infQuery, "", "")
	reply := gabs.New()
	dataEmpty := []string{}

	if response, err := ss.InfluxClient.Query(q); err == nil && response.Error() == nil {

		if len(response.Results[0].Series) != 1 {
			fmt.Printf("Expected 1 series in result, got %d", len(response.Results[0].Series))
			reply.Set(dataEmpty, "data")
			reply.Set(0, "total")
		} else {
			reply.Set(response, "data")
			reply.Set(1, "total")
		}

		reply.Set("ok", "status")
		return reply.String(), nil
	} else {

		reply.Set("ok", "status")
		reply.Set(0, "total")
		reply.Set(dataEmpty, "data")
		return reply.String(), nil
	}
}

// StatisticData: this method create new user in the database
func (ss *StatisticService) StatisticRetentionsList(statisticObject *model.StatisticSearchObject) (string, error) {

	q, err := buildShowRetentionPoliciesQuery(statisticObject.Param.Search.Database)
	if err != nil {
		logger.Error("Rejected statistic database: ", err)
		return "", err
	}

	logger.Debug(q.Command)
	reply := gabs.New()
	dataEmpty := []string{}

	if response, err := ss.InfluxClient.Query(q); err == nil && response.Error() == nil {

		if len(response.Results[0].Series) != 1 {
			fmt.Printf("Expected 1 series in result, got %d", len(response.Results[0].Series))
			reply.Set(dataEmpty, "data")
			reply.Set(0, "total")
		} else {
			reply.Set(response, "data")
			reply.Set(1, "total")
		}

		reply.Set("ok", "status")
		return reply.String(), nil
	} else {

		reply.Set("ok", "status")
		reply.Set(0, "total")
		reply.Set(dataEmpty, "data")
		return reply.String(), nil
	}
}

// StatisticData: this method create new user in the database
func (ss *StatisticService) StatisticMeasurementsList(dbId string) (string, error) {

	q, err := buildShowMeasurementsQuery(dbId)
	if err != nil {
		logger.Error("Rejected statistic database: ", err)
		return "", err
	}

	logger.Debug(q.Command)
	reply := gabs.New()
	dataEmpty := []string{}

	if response, err := ss.InfluxClient.Query(q); err == nil && response.Error() == nil {

		if len(response.Results[0].Series) != 1 {
			fmt.Printf("Expected 1 series in result, got %d", len(response.Results[0].Series))
			reply.Set(dataEmpty, "data")
			reply.Set(0, "total")
		} else {
			reply.Set(response, "data")
			reply.Set(1, "total")
		}

		reply.Set("ok", "status")
		return reply.String(), nil
	} else {

		reply.Set("ok", "status")
		reply.Set(0, "total")
		reply.Set(dataEmpty, "data")
		return reply.String(), nil
	}
}

// StatisticData: this method create new user in the database
func (ss *StatisticService) StatisticMetricsList(statisticObject *model.StatisticObject) (string, error) {

	if len(statisticObject.Param.Query) == 0 {
		return "", fmt.Errorf("statistic query is required")
	}

	query := statisticObject.Param.Query[0]
	q, err := buildShowFieldKeysQuery(query.Database, query.Retention, query.Main)
	if err != nil {
		logger.Error("Rejected statistic query parameters: ", err)
		return "", err
	}

	logger.Debug(q.Command)
	reply := gabs.New()
	dataEmpty := []string{}

	if response, err := ss.InfluxClient.Query(q); err == nil && response.Error() == nil {

		if len(response.Results[0].Series) != 1 {
			fmt.Printf("Expected 1 series in result, got %d", len(response.Results[0].Series))
			reply.Set(dataEmpty, "data")
			reply.Set(0, "total")
		} else {
			reply.Set(response, "data")
			reply.Set(1, "total")
		}

		reply.Set("ok", "status")
		return reply.String(), nil
	} else {

		reply.Set("ok", "status")
		reply.Set(0, "total")
		reply.Set(dataEmpty, "data")
		return reply.String(), nil
	}
}

// StatisticData: this method create new user in the database
func (ss *StatisticService) StatisticTagsList(statisticObject *model.StatisticObject) (string, error) {

	if len(statisticObject.Param.Query) == 0 {
		return "", fmt.Errorf("statistic query is required")
	}

	query := statisticObject.Param.Query[0]
	q, err := buildShowTagKeysQuery(query.Database, query.Retention, query.Main)
	if err != nil {
		logger.Error("Rejected statistic query parameters: ", err)
		return "", err
	}

	logger.Debug(q.Command)
	reply := gabs.New()
	dataEmpty := []string{}

	if response, err := ss.InfluxClient.Query(q); err == nil && response.Error() == nil {

		if len(response.Results[0].Series) != 1 {
			fmt.Printf("Expected 1 series in result, got %d", len(response.Results[0].Series))
			reply.Set(dataEmpty, "data")
			reply.Set(0, "total")
		} else {
			reply.Set(response, "data")
			reply.Set(1, "total")
		}

		reply.Set("ok", "status")
		return reply.String(), nil
	} else {

		reply.Set("ok", "status")
		reply.Set(0, "total")
		reply.Set(dataEmpty, "data")
		return reply.String(), nil
	}
}
