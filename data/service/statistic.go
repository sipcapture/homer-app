package service

import (
	"fmt"
	"strings"

	"github.com/Jeffail/gabs"
	client "github.com/influxdata/influxdb1-client/v2"
	"github.com/sipcapture/homer-app/model"
	"github.com/sirupsen/logrus"
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

	tagName := ""
	infQuery := ""
	myPrefix := ""

	for index, query := range statisticObject.Param.Query {
		logrus.Debugln("inside of the array", index)
		logrus.Debugln(query.Main)

		counterArray := []string{}
		for _, el := range query.Type {
			meanEl := fmt.Sprintf("mean(\"%s%s\") AS %s", myPrefix, el, el)
			counterArray = append(counterArray, meanEl)
			logrus.Debugln(counterArray)
		}

		infQuery = fmt.Sprintf("SELECT %s FROM %s.%s.\"%s\" WHERE time > %d AND %d > time %s GROUP BY time(%s) FILL(null) order by time DESC LIMIT %d;",
			strings.Join(counterArray, ","), query.Database, query.Retention, query.Main,
			(statisticObject.Timestamp.From * 1000000),
			(statisticObject.Timestamp.To * 1000000),
			tagName, indexRange, statisticObject.Param.Limit)

		logrus.Debugln(infQuery)
	}

	q := client.NewQuery(infQuery, "", "")
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

	logrus.Debugln(infQuery)

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

	infQuery := fmt.Sprintf("SHOW RETENTION POLICIES ON %s", statisticObject.Param.Search.Database)

	logrus.Debugln(infQuery)

	q := client.NewQuery(infQuery, statisticObject.Param.Search.Database, "")
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

	infQuery := fmt.Sprintf("SHOW MEASUREMENTS ON %s", dbId)

	logrus.Debugln(infQuery)

	q := client.NewQuery(infQuery, dbId, "")
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

	var infQuery string

	if statisticObject.Param.Query[0].Retention == "" || statisticObject.Param.Query[0].Retention == "none" {
		infQuery = fmt.Sprintf("SHOW FIELD KEYS FROM %s", statisticObject.Param.Query[0].Main)
	} else {
		infQuery = fmt.Sprintf("SHOW FIELD KEYS FROM %s.%s", statisticObject.Param.Query[0].Retention, statisticObject.Param.Query[0].Main)
	}
	logrus.Debugln(infQuery)

	q := client.NewQuery(infQuery, statisticObject.Param.Query[0].Database, "s")
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

	var infQuery string

	if statisticObject.Param.Query[0].Retention == "" || statisticObject.Param.Query[0].Retention == "none" {
		infQuery = fmt.Sprintf("SHOW TAG KEYS FROM %s", statisticObject.Param.Query[0].Main)
	} else {
		infQuery = fmt.Sprintf("SHOW TAG KEYS FROM %s.%s", statisticObject.Param.Query[0].Retention, statisticObject.Param.Query[0].Main)
	}

	logrus.Debugln(infQuery)

	q := client.NewQuery(infQuery, statisticObject.Param.Query[0].Database, "s")
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
