package service

import (
	"fmt"
	"strings"

	"github.com/Jeffail/gabs"
	client "github.com/influxdata/influxdb1-client/v2"
	"gitlab.com/qxip/webapp-go/model"
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
		fmt.Println("inside of the array", index)
		fmt.Println(query.Main)

		counterArray := []string{}
		for _, el := range query.Type {
			meanEl := fmt.Sprintf("mean(\"%s%s\") AS %s", myPrefix, el, el)
			counterArray = append(counterArray, meanEl)
			fmt.Println(counterArray)
		}

		infQuery = fmt.Sprintf("SELECT %s FROM %s.%s.\"%s\" WHERE time > %d AND %d > time %s GROUP BY time(%s) FILL(null) LIMIT %d;",
			strings.Join(counterArray, ","), query.Database, query.Retention, query.Main,
			(statisticObject.Timestamp.From * 1000000),
			(statisticObject.Timestamp.To * 1000000),
			tagName, indexRange, statisticObject.Param.Limit)

		fmt.Println(infQuery)

	}

	q := client.NewQuery(infQuery, "", "")
	reply := gabs.New()
	dataEmpty := []string{}
	//allPoints := [][]model.StatisticPoint{}

	if response, err := ss.InfluxClient.Query(q); err == nil && response.Error() == nil {

		if len(response.Results[0].Series) != 1 {
			fmt.Printf("Expected 1 series in result, got %d", len(response.Results[0].Series))
		}

		/*
			for _, v := range response.Results[0].Series {

				dataPoints := []model.StatisticPoint{}
				for _, valValue := range v.Values {
					//fmt.Printf("COL value[%s] [%d]\n", valValue, colIndex)

					var retportTime int64 = 0
					for vSubIndex, vSubValue := range valValue {
						colValue := v.Columns[vSubIndex]
						if colValue == "time" {
							str := fmt.Sprintf("%v", vSubValue)
							t, err := time.Parse(time.RFC3339, str)
							if err != nil {
								fmt.Println(err)
							}
							retportTime = int64(t.Unix())
						} else {
							var dataPoint model.StatisticPoint
							dataPoint.Table = v.Name
							dataPoint.Transaction = "statistic"
							dataPoint.Partid = 10
							dataPoint.Attemps = 1
							dataPoint.Countername = colValue
							str := fmt.Sprintf("%v", vSubValue)
							if dataPoint.Value, err = strconv.ParseFloat(str, 64); err != nil {
								dataPoint.Value = 0
							}
							dataPoint.Reporttime = retportTime
							dataPoints = append(dataPoints, dataPoint)
						}
					}
				}
				allPoints = append(allPoints, dataPoints)
			}
		*/

		//fmt.Println(response.Results)
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
