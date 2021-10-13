package model

import (
	"encoding/json"
)

// swagger:model GrafanaObject
type GrafanaObject struct {
	Param struct {
		Limit    int             `json:"limit"`
		Search   string          `json:"search"`
		Server   string          `json:"server"`
		Timezone json.RawMessage `json:"timezone"`
	} `json:"param"`
	Timestamp struct {
		From int64 `json:"from"`
		To   int64 `json:"to"`
	} `json:"timestamp"`
}

type GrafanaResponse struct {
	Total int             `json:"total"`
	D     json.RawMessage `json:"data"`
}

// Salutation : here you tell us what Salutation is
// Printer : what is this?
// Greet : describe what this function does
// CreateMessage : describe what this function does
type GrafanaPoint struct {
	Attemps     int     `json:"attemps"`
	Partid      int     `json:"partid"`
	Group       int     `json:"group"`
	Id          int     `json:"id"`
	Reporttime  int64   `json:"reporttime"`
	Table       string  `json:"table"`
	Tag1        string  `json:"tag1"`
	Transaction string  `json:"transaction"`
	Countername string  `json:"countername"`
	Value       float64 `json:"value"`
}

// swagger:model GrafanaResponseValue
type GrafanaResponseValue struct {
	Dashboard struct {
		Annotations struct {
			List []struct {
				BuiltIn    int    `json:"builtIn"`
				Datasource string `json:"datasource"`
				Enable     bool   `json:"enable"`
				Hide       bool   `json:"hide"`
				IconColor  string `json:"iconColor"`
				Name       string `json:"name"`
				Type       string `json:"type"`
			} `json:"list"`
		} `json:"annotations"`
		Editable     bool          `json:"editable"`
		GnetID       interface{}   `json:"gnetId"`
		GraphTooltip int           `json:"graphTooltip"`
		ID           int           `json:"id"`
		Links        []interface{} `json:"links"`
		Panels       []struct {
			AliasColors struct {
			} `json:"aliasColors"`
			Bars        bool   `json:"bars"`
			DashLength  int    `json:"dashLength"`
			Dashes      bool   `json:"dashes"`
			Datasource  string `json:"datasource"`
			FieldConfig struct {
				Defaults struct {
					Custom struct {
					} `json:"custom"`
				} `json:"defaults"`
				Overrides []interface{} `json:"overrides"`
			} `json:"fieldConfig"`
			Fill         int `json:"fill"`
			FillGradient int `json:"fillGradient"`
			GridPos      struct {
				H int `json:"h"`
				W int `json:"w"`
				X int `json:"x"`
				Y int `json:"y"`
			} `json:"gridPos"`
			HiddenSeries bool `json:"hiddenSeries"`
			ID           int  `json:"id"`
			Legend       struct {
				Avg     bool `json:"avg"`
				Current bool `json:"current"`
				Max     bool `json:"max"`
				Min     bool `json:"min"`
				Show    bool `json:"show"`
				Total   bool `json:"total"`
				Values  bool `json:"values"`
			} `json:"legend"`
			Lines         bool   `json:"lines"`
			Linewidth     int    `json:"linewidth"`
			NullPointMode string `json:"nullPointMode"`
			Options       struct {
				AlertThreshold bool `json:"alertThreshold"`
			} `json:"options"`
			Percentage      bool          `json:"percentage"`
			PluginVersion   string        `json:"pluginVersion"`
			Pointradius     int           `json:"pointradius"`
			Points          bool          `json:"points"`
			Renderer        string        `json:"renderer"`
			SeriesOverrides []interface{} `json:"seriesOverrides"`
			SpaceLength     int           `json:"spaceLength"`
			Stack           bool          `json:"stack"`
			SteppedLine     bool          `json:"steppedLine"`
			Targets         []struct {
				DateTimeType   string `json:"dateTimeType"`
				Extrapolate    bool   `json:"extrapolate"`
				Format         string `json:"format"`
				FormattedQuery string `json:"formattedQuery"`
				IntervalFactor int    `json:"intervalFactor"`
				Query          string `json:"query"`
				RawQuery       string `json:"rawQuery"`
				RefID          string `json:"refId"`
				Round          string `json:"round"`
				SkipComments   bool   `json:"skip_comments"`
			} `json:"targets"`
			Thresholds  []interface{} `json:"thresholds"`
			TimeFrom    interface{}   `json:"timeFrom"`
			TimeRegions []interface{} `json:"timeRegions"`
			TimeShift   interface{}   `json:"timeShift"`
			Title       string        `json:"title"`
			Tooltip     struct {
				Shared    bool   `json:"shared"`
				Sort      int    `json:"sort"`
				ValueType string `json:"value_type"`
			} `json:"tooltip"`
			Type  string `json:"type"`
			Xaxis struct {
				Buckets interface{}   `json:"buckets"`
				Mode    string        `json:"mode"`
				Name    interface{}   `json:"name"`
				Show    bool          `json:"show"`
				Values  []interface{} `json:"values"`
			} `json:"xaxis"`
			Yaxes []struct {
				Format  string      `json:"format"`
				Label   interface{} `json:"label"`
				LogBase int         `json:"logBase"`
				Max     interface{} `json:"max"`
				Min     interface{} `json:"min"`
				Show    bool        `json:"show"`
			} `json:"yaxes"`
			Yaxis struct {
				Align      bool        `json:"align"`
				AlignLevel interface{} `json:"alignLevel"`
			} `json:"yaxis"`
		} `json:"panels"`
		Refresh       bool          `json:"refresh"`
		SchemaVersion int           `json:"schemaVersion"`
		Style         string        `json:"style"`
		Tags          []interface{} `json:"tags"`
		Templating    struct {
			List []interface{} `json:"list"`
		} `json:"templating"`
		Time struct {
			From string `json:"from"`
			To   string `json:"to"`
		} `json:"time"`
		Timepicker struct {
		} `json:"timepicker"`
		Timezone string `json:"timezone"`
		Title    string `json:"title"`
		UID      string `json:"uid"`
		Version  int    `json:"version"`
	} `json:"dashboard"`
	Meta struct {
		CanAdmin              bool   `json:"canAdmin"`
		CanEdit               bool   `json:"canEdit"`
		CanSave               bool   `json:"canSave"`
		CanStar               bool   `json:"canStar"`
		Created               string `json:"created"`
		CreatedBy             string `json:"createdBy"`
		Expires               string `json:"expires"`
		FolderID              int    `json:"folderId"`
		FolderTitle           string `json:"folderTitle"`
		FolderUID             string `json:"folderUid"`
		FolderURL             string `json:"folderUrl"`
		HasACL                bool   `json:"hasAcl"`
		IsFolder              bool   `json:"isFolder"`
		Provisioned           bool   `json:"provisioned"`
		ProvisionedExternalID string `json:"provisionedExternalId"`
		Slug                  string `json:"slug"`
		Type                  string `json:"type"`
		Updated               string `json:"updated"`
		UpdatedBy             string `json:"updatedBy"`
		URL                   string `json:"url"`
		Version               int    `json:"version"`
	} `json:"meta"`
}

// swagger:model GrafanaFolders
type GrafanaFolders []struct {
	// example: 79
	ID int `json:"id"`
	// example: false
	IsStarred bool `json:"isStarred"`
	// example:
	Slug string `json:"slug"`
	// example: 0
	SortMeta int `json:"sortMeta"`
	// example:
	Tags []interface{} `json:"tags"`
	// example: Alerts
	Title string `json:"title"`
	// example: dash-folder
	Type string `json:"type"`
	// example: _tTJl1sMk
	UID string `json:"uid"`
	// example: db/alerts
	URI string `json:"uri"`
	// example: /grafana/dashboards/f/_tTJl1sMk/alerts
	URL string `json:"url"`
}

// swagger:model GrafanaOrg
type GrafanaOrg struct {
	Address struct {
		// example: 148 East Saxton Lane
		Address1 string `json:"address1"`
		// example: apt 6
		Address2 string `json:"address2"`
		// example: New Hyde Park
		City string `json:"city"`
		// example: USA
		Country string `json:"country"`
		// example: NY
		State string `json:"state"`
		// example: 11040
		ZipCode string `json:"zipCode"`
	} `json:"address"`
	// example: 1
	ID int `json:"id"`
	// example: Expo Superstore
	Name string `json:"name"`
}

// swagger:model GrafanaUrl
type GrafanaUrl struct {
	// example: localhost:3000
	Data string `json:"data"`
}

// swagger:model GrafanaSearch
type GrafanaSearch []struct {
	FolderID    int           `json:"folderId"`
	FolderTitle string        `json:"folderTitle"`
	FolderUID   string        `json:"folderUid"`
	FolderURL   string        `json:"folderUrl"`
	ID          int           `json:"id"`
	IsStarred   bool          `json:"isStarred"`
	Slug        string        `json:"slug"`
	SortMeta    int           `json:"sortMeta"`
	Tags        []interface{} `json:"tags"`
	Title       string        `json:"title"`
	Type        string        `json:"type"`
	UID         string        `json:"uid"`
	URI         string        `json:"uri"`
	URL         string        `json:"url"`
}
