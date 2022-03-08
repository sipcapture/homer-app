package jsonschema

import (
	"encoding/json"
)

// this is version
var TableVersion = map[string]int{
	"versions":               1,
	"auth_token":             1,
	"applications":           1,
	"agent_location_session": 1,
	"alias":                  1,
	"global_settings":        1,
	"hepsub_mapping_schema":  1,
	"mapping_schema":         1,
	"users":                  1,
	"user_settings":          1,
}

var MinimumPgSQL = 10

var AuthTypesConfig = `{"internal": {"name": "Internal","type": "internal","position": 1, "enable": true},"ldap": {"name": "LDAP", "type": "ldap", "position": 2, "enable": false}}`

var DashboardHome = json.RawMessage(`{
    "alias": "home",
    "config": {
        "columns": 28,
        "draggable": { "handle": ".box-header" },
        "gridType": "scrollVertical",
        "ignoreMinSize": "warning",
        "margins": [10, 10],
        "maxrows": 28,
        "pushing": false,
        "resizable": {
            "enabled": true,
            "handles": ["n", "e", "s", "w", "ne", "se", "sw", "nw"]
        }
    },
    "dashboardId": "home",
    "id": "home",
    "isLocked": false,
    "name": "Home",
    "param": "home",
    "selectedItem": "",
    "shared": false,
    "title": "Home",
    "type": 3,
    "weight": 10,
    "widgets": [
        {
            "activeTab": true,
            "cols": 6,
            "config": {
                "config": {
                    "title": "CALL SIP SEARCH",
                    "searchbutton": true,
                    "protocol_id": { "name": "SIP", "value": 1 },
                    "protocol_profile": { "name": "call", "value": "call" }
                },
                "countFieldColumns": 1,
                "fields": [
                    {
                        "field_name": "data_header.from_user",
                        "hepid": 1,
                        "name": "1:call:data_header.from_user",
                        "selection": "SIP From user",
                        "type": "string"
                    },
                    {
                        "field_name": "data_header.to_user",
                        "hepid": 1,
                        "name": "1:call:data_header.to_user",
                        "selection": "SIP To user",
                        "type": "string"
                    },
                    {
                        "field_name": "data_header.method",
                        "hepid": 1,
                        "name": "1:call:data_header.method",
                        "selection": "SIP Method",
                        "type": "string"
                    },
                    {
                        "field_name": "data_header.callid",
                        "hepid": 1,
                        "name": "1:call:data_header.callid",
                        "selection": "SIP Callid",
                        "type": "string"
                    },
                    {
                        "field_name": "limit",
                        "hepid": 1,
                        "name": "1:call:limit",
                        "selection": "Query Limit",
                        "type": "string"
                    },
                    {
                        "field_name": "targetResultsContainer",
                        "hepid": 1,
                        "name": "1:call:targetResultsContainer",
                        "selection": "Results Container",
                        "type": "string"
                    }
                ],
                "title": "CALL SIP SEARCH"
            },
            "id": "display-results-1",
            "isWarning": true,
            "layerIndex": 2,
            "minItemCols": 1,
            "minItemRows": 1,
            "name": "display-results",
            "output": {},
            "rows": 9,
            "strongIndex": "ProtosearchWidgetComponent",
            "tabGroup": "tabIndex-298361",
            "title": "TDR Call Search",
            "x": 0,
            "y": 0
        },
        {
            "cols": 22,
            "config": { "title": "Widget Result" },
            "id": "RESULT-1",
            "isWarning": true,
            "layerIndex": 2,
            "minHeight": 400,
            "minItemCols": 1,
            "minItemRows": 1,
            "minWidth": 650,
            "name": "RESULT",
            "output": {},
            "rows": 12,
            "strongIndex": "ResultWidgetComponent",
            "tabGroup": "tabIndex-522642",
            "title": "RESULT-1",
            "x": 6,
            "y": 0
        },
        {
            "cols": 6,
            "config": {
                "datePattern": "YYYY-MM-DD",
                "fontSizeClock": 20,
                "fontSizeDate": 20,
                "id": "clock-1",
                "location": {
                    "desc": "Europe/Amsterdam",
                    "name": "Europe/Amsterdam",
                    "offset": "+2"
                },
                "radius": 177.46875,
                "showAnalog": "Digital",
                "showDate": true,
                "showseconds": false,
                "timePattern": "HH:mm:ss",
                "title": "Home Clock"
            },
            "id": "clock-1",
            "layerIndex": 2,
            "name": "clock",
            "output": {},
            "rows": 3,
            "strongIndex": "ClockWidgetComponent",
            "tabGroup": "tabIndex-306538",
            "title": "World Clock",
            "x": 0,
            "y": 9
        }
    ]
}
`)

var DashboardSmartSearch = json.RawMessage(`{
  "alias": "smartsearch",
  "config": {
    "columns": 8,
    "grafanaProxy": false,
    "grafanaTimestamp": false,
    "gridType": "fit",
    "ignoreMinSize": "warning",
    "maxrows": 18,
    "pushing": true
  },
  "dashboardId": "smartsearch",
  "id": "smartsearch",
  "isLocked": false,
  "name": "Smart search",
  "param": "smart search",
  "selectedItem": "",
  "shared": false,
  "type": 1,
  "weight": 10,
  "widgets": [
    {
      "cols": 8,
      "config": {
        "col": 1,
        "cols": 2,
        "config": {
          "protocol_id": {
            "name": "SIP",
            "value": 1
          },
          "protocol_profile": {
            "name": "call",
            "value": "call"
          },
          "searchbutton": false,
          "title": "Smart input Search"
        },
        "countFieldColumns": 4,
        "description": "Display Smart input Search Form component",
        "fields": [
          {
            "field_name": "proto_selector",
            "form_default": null,
            "hepid": 1,
            "name": "60:call_h20:proto_selector",
            "selection": "Protocol",
            "shown": true,
            "type": "string",
            "value": ""
          },
          {
            "field_name": "smartinput",
            "form_api": "/smart/search/tag/:hepid/:hepprofile",
            "form_type": "smart-input",
            "full_api_link": "/smart/search/tag/1/call",
            "hepid": 1,
            "name": "60:call_h20:smartinput",
            "selection": "Smart Input",
            "type": "string",
            "value": ""
          },
          {
            "field_name": "limit",
            "form_default": null,
            "hepid": 1,
            "name": "60:call_h20:limit",
            "selection": "Query Limit",
            "shown": false,
            "type": "string",
            "value": ""
          },
          {
            "field_name": "targetResultsContainer",
            "form_default": null,
            "hepid": 1,
            "name": "1:call:targetResultsContainer",
            "selection": "Results Container",
            "shown": false,
            "type": "string",
            "value": ""
          }
        ],
        "group": "Search",
        "id": "smart-input-1_e5d82cdc-7d04-465a-b661-a084033d576a",
        "name": "smart-input",
        "refresh": false,
        "row": 0,
        "rows": 2,
        "sizeX": 2,
        "sizeY": 2,
        "title": "Smart input Search",
        "uuid": "ed426bd0-ff21-40f7-8852-58700abc3762",
        "x": 0,
        "y": 1
      },
      "id": "smart-input-1_e5d82cdc-7d04-465a-b661-a084033d576a",
      "isWarning": true,
      "layerIndex": 2,
      "minHeight": 300,
      "minWidth": 300,
      "name": "smart-input",
      "output": {},
      "rows": 2,
      "strongIndex": "SmartInputWidgetComponent",
      "tabGroup": "tabIndex-243367",
      "title": "Smart input Search",
      "x": 0,
      "y": 0
    },
    {
      "activeTab": true,
      "cols": 8,
      "config": null,
      "id": "RESULT-1_8284f4b3-cc50-4aab-975c-63a946716851",
      "isWarning": false,
      "layerIndex": 2,
      "minHeight": 400,
      "minWidth": 650,
      "name": "RESULT",
      "output": {},
      "rows": 16,
      "strongIndex": "ResultWidgetComponent",
      "tabGroup": "tabIndex-309576",
      "title": "RESULT-1",
      "x": 0,
      "y": 2
    }
  ]
}
`)

var DashboardRegister = json.RawMessage(`{"alias":"registration","config":{"columns":5,"gridType":"scrollVertical","ignoreMinSize":"Ignore","maxrows":3,"pushing":true},"id":"registration","name":"REGISTRATION","param":"registration-dashboard","selectedItem":"","shared":false,"type":1,"weight":10,"widgets":[{"cols":1,"config":{"col":1,"cols":2,"config":{"protocol_id":{"name":"SIP","value":1},"protocol_profile":{"name":"registration","value":"registration"},"searchbutton":true,"title":"Registration Search"},"countFieldColumns":1,"description":"Display Search Form component","fields":[{"field_name":"data_header.method","hepid":1,"name":"1:registration:data_header.method","selection":"SIP Method","type":"string","value":""},{"field_name":"targetResultsContainer","hepid":1,"name":"1:registration:targetResultsContainer","selection":"Results Container","type":"string","value":""},{"field_name":"data_header.protocol","hepid":1,"name":"1:registration:data_header.protocol","selection":"SIP Protocol","type":"string","value":""}],"group":"Search","id":"display-results537","name":"protosearch","refresh":false,"row":0,"rows":2,"sizeX":2,"sizeY":2,"title":"Registration Search","uuid":"ed426bd0-ff21-40f7-8852-58700abc3762","x":0,"y":1},"id":"display-results537","name":"display-results","output":{},"rows":2,"strongIndex":"ProtosearchWidgetComponent","title":"Proto Search","x":0,"y":0},{"cols":4,"id":"result356","name":"result","output":{},"rows":2,"strongIndex":"ResultWidgetComponent","title":"Display Results","x":1,"y":0}]}`)

var CorrelationMappingdefault = json.RawMessage(`{
  "lookup_id": 0,
  "lookup_type": "pubsub",
  "lookup_field": "{\"data\":$source_field,\"fromts\":$fromts,\"tots\":$tots}",
  "lookup_range": [
      -300,
      200
  ],
  "source_fields": {
      "sid": "data_header.sid",
      "source_ip": "data_header.srcIp"
  },
  "lookup_profile": "cdr"
}`)

var EmptyJson = json.RawMessage(`{}`)

var DefaultAdminPassword = "sipcapture"
var DefaultSupportPassword = "sipcapture"

var GrafanaConfig = json.RawMessage(`{"host": "http://grafana:3000","user": "admin","password":"admin","token": "ABCDEFGHKLMN"}`)

var PrometheusConfig = json.RawMessage(`{"host":"http://prometheus:9090/api/v1/"}`)

var LokiConfig = json.RawMessage(`{"host":"http://loki:3100"}`)

var ExportConfig = json.RawMessage(`{"openwindow": false,"tabpositon": "flow"}`)
var TransactionConfig = json.RawMessage(`{"tabpositon": "flow", "lookup_range": [-300, 200]}`)

var AgentObjectforAuthToken = json.RawMessage(`{
   "username": "test",
   "firstname": "Tester",
   "lastname": "Tester",
   "email": "tester@test.com",
   "usergroup": "user",
   "id": 1000,
   "partid": 10
  }`)

var FieldsMapping1call = json.RawMessage(`[
	{
	  "id": "sid",
	  "type": "string",
	  "index": "secondary",
	  "name": "Session ID",
	  "form_type": "input",
	  "position": 1,
	  "sid_type": true,
	  "hide": false
	},
	{
	  "id": "data_header.method",
	  "name": "SIP Method",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "form_default": [
		"INVITE",
		"BYE",
		"100",
		"200",
		"183",
		"CANCEL"
	  ],
	  "position": 2,
	  "skip": false,
	  "hide": false,
	  "method_type": true
	},
	{
	  "id": "protocol_header.correlation_id",
	  "name": "Correlation ID",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 3,
	  "skip": false,
	  "hide": true,
	  "sid_type": true
	},
	{
	  "id": "data_header.callid",
	  "name": "CallID",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 4,
	  "skip": false,
	  "hide": true,
	  "sid_type": true
  },
  {
    "id": "data_header.ruri_user",
    "name": "RURI user",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 5,
    "skip": false,
    "hide": true
  },
	{
	  "id": "data_header.from_user",
	  "name": "SIP From user",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 6,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "data_header.to_user",
	  "name": "SIP To user",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 7,
	  "skip": false,
	  "hide": false
	},
  {
    "id": "data_header.user_agent",
    "name": "User Agent",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 8,
    "skip": false,
    "hide": true
  },
	{
	  "id": "protocol_header.srcIp",
	  "name": "Source IP",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 8,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.srcPort",
	  "name": "Src Port",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 9,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.dstIp",
	  "name": "Destination IP",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 10,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.dstPort",
	  "name": "Dst Port",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 11,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.timeSeconds",
	  "name": "Timeseconds",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 12,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.timeUseconds",
	  "name": "Usecond time",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 13,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.payloadType",
	  "name": "Payload type",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 14,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.protocolFamily",
	  "name": "Proto Family",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 15,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.protocol",
	  "name": "Protocol Type",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 16,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.captureId",
	  "name": "Capture ID",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 17,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.capturePass",
	  "name": "Capture Pass",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 18,
	  "skip": true,
	  "hide": true
	},
	{
	  "id": "data_header.cseq",
	  "name": "SIP Cseq",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 19,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "data_header.from_tag",
	  "name": "SIP From tag",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 20,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "data_header.protocol",
	  "name": "SIP Protocol",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 21,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "raw",
	  "name": "SIP RAW",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 22,
	  "skip": false,
	  "hide": true
  },
  {
    "id": "profile",
    "name": "Profile",
    "type": "string",
    "index": "none",
    "form_type": "select",
    "form_default": [
        "call",
        "registration",
        "default"
    ],
    "position": 23,
    "skip": false,
    "hide": true,
    "profile": true
  },
  {
    "id": "node",
    "name": "Node",
    "type": "string",
    "index": "none",
    "form_type": "multiselect",
    "form_default": [
        {"value":"localnode","name":"Local node"}
    ],
    "_form_api": "/database/node/list",
    "system_param": true,
    "mapping": "param.location.node",
    "position": 23,
    "skip": true,
    "hide": true
  }
  ]
`)

var FieldsMapping1default = json.RawMessage(`[
	{
	  "id": "sid",
	  "type": "string",
	  "index": "secondary",
	  "name": "Session ID",
	  "form_type": "input",
	  "position": 1,
	  "sid_type": true,
	  "hide": false
	},
	{
	  "id": "data_header.method",
	  "name": "SIP Method",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "form_default": [
		"INVITE",
		"BYE",
		"100",
		"200",
		"REGISTER",
    "CANCEL",
    "OPTIONS",
    "NOTIFY"
	  ],
	  "position": 2,
	  "skip": false,
	  "hide": false,
	  "method_type": true
	},
	{
	  "id": "protocol_header.correlation_id",
	  "name": "Correlation ID",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 3,
	  "skip": false,
	  "hide": true,
	  "sid_type": true
	},
	{
	  "id": "data_header.callid",
	  "name": "SIP Callid",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 4,
	  "skip": false,
	  "hide": true,
	  "sid_type": true
  },
	{
	  "id": "data_header.from_user",
	  "name": "SIP From user",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 6,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "data_header.to_user",
	  "name": "SIP To user",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 7,
	  "skip": false,
	  "hide": false
	},
  {
    "id": "data_header.user_agent",
    "name": "User Agent",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 8,
    "skip": false,
    "hide": true
  },
	{
	  "id": "protocol_header.srcIp",
	  "name": "Source IP",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 8,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.srcPort",
	  "name": "Src Port",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 9,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.dstIp",
	  "name": "Destination IP",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 10,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.dstPort",
	  "name": "Dst Port",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 11,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.timeSeconds",
	  "name": "Timeseconds",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 12,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.timeUseconds",
	  "name": "Usecond time",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 13,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.payloadType",
	  "name": "Payload type",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 14,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.protocolFamily",
	  "name": "Proto Family",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 15,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.protocol",
	  "name": "Protocol Type",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 16,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.captureId",
	  "name": "Capture ID",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 17,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.capturePass",
	  "name": "Capture Pass",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 18,
	  "skip": true,
	  "hide": true
	},
	{
	  "id": "data_header.cseq",
	  "name": "SIP Cseq",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 19,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "data_header.from_tag",
	  "name": "SIP From tag",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 20,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "data_header.protocol",
	  "name": "SIP Protocol",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 21,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "raw",
	  "name": "SIP RAW",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 22,
	  "skip": false,
	  "hide": true
  },
  {
    "id": "node",
    "name": "Node",
    "type": "string",
    "index": "none",
    "form_type": "multiselect",
    "form_default": [
        {"value":"localnode","name":"Local node"}
    ],
    "_form_api": "/database/node/list",  
    "system_param": true,
    "mapping": "param.location.node",
    "position": 23,
    "skip": true,
    "hide": true
  },
  {
    "id": "profile",
    "name": "Profile",
    "type": "string",
    "index": "none",
    "form_type": "select",
    "form_default": [
        "call",
        "registration",
        "default"
    ],
    "position": 23,
    "skip": false,
    "hide": true,
    "profile": true
  },
  {
    "id": "smartinput",
    "name": "Smart Input",
    "type": "string",
    "index": "none",
    "form_type": "smart-input",
    "form_api": "/smart/search/tag/:hepid/:hepprofile",
    "position": 24,
    "skip": false,
    "hide": true
  }
  ]
`)

var FieldsMapping34default = json.RawMessage(`[
  {
    "id": "sid",
    "type": "string",
    "index": "secondary",
    "name": "Session ID",
    "form_type": "input",
    "position": 1,
    "skip": false,
    "hide": false,
    "sid_type": true
  },
  {
    "id": "protocol_header.correlation_id",
    "name": "Correlation ID",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 2,
    "skip": false,
    "hide": true,
    "sid_type": true
  },
  {
    "id": "protocol_header.srcIp",
    "name": "Source IP",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 3,
    "skip": false,
    "hide": false
  },
  {
    "id": "protocol_header.srcPort",
    "name": "Src Port",
    "type": "integer",
    "index": "none",
    "form_type": "input",
    "position": 4,
    "skip": false,
    "hide": false
  },
  {
    "id": "protocol_header.dstIp",
    "name": "Destination IP",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 5,
    "skip": false,
    "hide": false
  },
  {
    "id": "protocol_header.dstPort",
    "name": "Dst Port",
    "type": "integer",
    "index": "none",
    "form_type": "input",
    "position": 6,
    "skip": false,
    "hide": false
  },
  {
    "id": "protocol_header.timeSeconds",
    "name": "Timeseconds",
    "type": "integer",
    "index": "none",
    "form_type": "input",
    "position": 7,
    "skip": false,
    "hide": true
  },
  {
    "id": "protocol_header.timeUseconds",
    "name": "Usecond time",
    "type": "integer",
    "index": "none",
    "form_type": "input",
    "position": 8,
    "skip": false,
    "hide": true
  },
  {
    "id": "protocol_header.protocolFamily",
    "name": "Proto Family",
    "type": "integer",
    "index": "none",
    "form_type": "input",
    "position": 9,
    "skip": false,
    "hide": true
  },
  {
    "id": "protocol_header.protocol",
    "name": "Protocol Type",
    "type": "integer",
    "index": "none",
    "form_type": "input",
    "position": 10,
    "skip": false,
    "hide": true
  },
  {
    "id": "protocol_header.payloadType",
    "name": "Payload type",
    "type": "integer",
    "index": "none",
    "form_type": "input",
    "position": 11,
    "skip": false,
    "hide": true
  },
  {
    "id": "protocol_header.captureId",
    "name": "Capture ID",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 12,
    "skip": false,
    "hide": true
  },
  {
    "id": "protocol_header.capturePass",
    "name": "Capture Pass",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 13,
    "skip": true,
    "hide": true
  },
  {
    "id": "raw",
    "name": "RAW",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 14,
    "skip": true,
    "hide": true
  }
]`)

var FieldsMapping100default = json.RawMessage(`[
  {
      "id": "sid",
      "type": "string",
      "index": "secondary",
      "alias": "callid",
      "name": "Session ID",
      "form_type": "input",
      "position": 1,
      "skip": false,
      "hide": false,
      "sid_type": true
  },
  {
      "id": "protocol_header.correlation_id",
      "name": "Correlation ID",
      "type": "string",
      "index": "none",
      "form_type": "input",
      "position": 3,
      "skip": false,
      "hide": true,
      "sid_type": true
  },
  {
      "id": "protocol_header.srcIp",
      "name": "Source IP",
      "type": "string",
      "index": "none",
      "form_type": "input",
      "position": 8,
      "skip": false,
      "hide": false
  },
  {
      "id": "protocol_header.srcPort",
      "name": "Src Port",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 9,
      "skip": false,
      "hide": false
  },
{
      "id": "protocol_header.dstIp",
      "name": "Destination IP",
      "type": "string",
      "index": "none",
      "form_type": "input",
      "position": 10,
      "skip": false,
      "hide": false
  },
  {
      "id": "protocol_header.dstPort",
      "name": "Dst Port",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 11,
      "skip": false,
      "hide": false
  },
   {
      "id": "protocol_header.timeSeconds",
      "name": "Timeseconds",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 12,
      "skip": false,
      "hide": true
  },
  {
      "id": "protocol_header.timeUseconds",
      "name": "Usecond time",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 13,
      "skip": false,
      "hide": true
  },
   {
      "id": "protocol_header.payloadType",
      "name": "Payload type",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 14,
      "skip": false,
      "hide": true
  },
  {
      "id": "protocol_header.protocolFamily",
      "name": "Proto Family",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 15,
      "skip": false,
      "hide": true
  },
  {
      "id": "protocol_header.protocol",
      "name": "Protocol Type",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 16,
      "skip": false,
      "hide": true
  },
  {
      "id": "protocol_header.captureId",
      "name": "Capture ID",
      "type": "string",
      "index": "none",
      "form_type": "input",
      "position": 17,
      "skip": false,
      "hide": true
  },
  {
      "id": "protocol_header.capturePass",
      "name": "Capture Pass",
      "type": "string",
      "index": "none",
      "form_type": "input",
      "position": 18,
      "skip": true,
      "hide": true
  },
  {
      "id": "data_header.protocol",
      "name": "SIP Protocol",
      "type": "string",
      "index": "none",
      "form_type": "input",
      "position": 21,
      "skip": false,
      "hide": true
  },
  {
      "id": "raw",
      "name": "RAW",
      "type": "string",
      "index": "none",
      "form_type": "input",
      "position": 16,
      "skip": false,
      "hide": false
  }
]`)

var FieldsMapping1000default = json.RawMessage(`[
  {
    "id": "sid",
    "type": "string",
    "index": "secondary",
    "name": "Session ID",
    "form_type": "input",
    "position": 1,
    "skip": false,
    "hide": false,
    "sid_type": true
  },
  {
    "id": "protocol_header.address",
    "name": "Proto Address",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 2,
    "skip": false,
    "hide": false
  },
  {
    "id": "data_header.family",
    "name": "Family",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 3,
    "skip": false,
    "hide": true
  },
  {
    "id": "protocol_header.srcPort",
    "name": "Protocol port",
    "type": "integer",
    "index": "none",
    "form_type": "input",
    "position": 4,
    "skip": false,
    "hide": false
  },
  {
    "id": "data_header.type",
    "name": "Data type",
    "type": "integer",
    "index": "none",
    "form_type": "input",
    "position": 5,
    "skip": false,
    "hide": true
  },
  {
    "id": "data_header.handle",
    "name": "Data Handle",
    "type": "integer",
    "index": "none",
    "form_type": "input",
    "position": 6,
    "skip": false,
    "hide": true
  },
  {
    "id": "data_header.event",
    "name": "Data Event",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 7,
    "skip": false,
    "hide": false
  },
  {
    "id": "data_header.medium",
    "name": "Data Medium",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 8,
    "skip": false,
    "hide": true
  },
  {
    "id": "data_header.source",
    "name": "Data Source",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 9,
    "skip": false,
    "hide": false
  },
  {
    "id": "data_header.session",
    "name": "Data Session",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 10,
    "skip": false,
    "hide": false
  },
  {
    "id": "raw",
    "name": "RAW",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 11,
    "skip": true,
    "hide": true
  }
]`)

var FieldsMapping2000loki = json.RawMessage(`[
	{
		  "id": "micro_ts",
		  "name": "Timeseconds",
		  "type": "integer",
		  "index": "none",
		  "form_type": "input",
		  "date_field": true,
		  "position": 1,
		  "skip": false,
		  "hide": false
	},{
		  "id": "custom_1",
		  "name": "Message",
		  "type": "string",
		  "index": "none",
		  "form_type": "input",
		  "position": 2,
		  "skip": false,
		  "hide": false,
		  "autoheight": true
	},{
		  "id": "custom_2",
		  "name": "Labels",
		  "type": "string",
		  "index": "none",
		  "form_type": "input",
		  "position": 3,
		  "skip": false,
		  "hide": false
	}
]`)

var CorrelationMapping1call = json.RawMessage(`[
    {
        "source_field": "protocol_header.correlation_id",
        "lookup_id": 1,
        "lookup_profile": "call",
        "lookup_field": "sid",
        "lookup_range": [
            -300,
            200
        ]
    },
    {
        "source_field": "data_header.callid",
        "lookup_id": 1,
        "lookup_profile": "call",
        "lookup_field": "data_header->>'callid'",
        "lookup_range": [
            -300,
            200
        ],
        "input_function_js": "var returnData=[]; for (var i = 0; i < data.length; i++) { returnData.push(data[i]+'_b2b-1'); }; returnData;"
    }
	]	
`)

var CorrelationMapping1registration = json.RawMessage(`[
    {
        "source_field": "protocol_header.correlation_id",
        "lookup_id": 1,
        "lookup_profile": "registration",
        "lookup_field": "sid",
        "lookup_range": [
            -300,
            200
        ]
    }
	]
`)

var CorrelationMapping1default = json.RawMessage(`[
    {
        "source_field": "protocol_header.correlation_id",
        "lookup_id": 1,
        "lookup_profile": "default",
        "lookup_field": "sid",
        "lookup_range": [
            -300,
            200
        ]
    }
	]
`)

var CorrelationMapping100default = json.RawMessage(`[
		{
			"source_field": "sid",
			"lookup_id": 1,
			"lookup_profile": "call",
			"lookup_field": "data_header.callid",
			"lookup_range": [-300, 200]
		},
		{
			"source_field": "sid",
			"lookup_id": 1,
			"lookup_profile": "registration",
			"lookup_field": "data_header.callid",
			"lookup_range": [-300, 200]
		},{
			"source_field": "sid",
			"lookup_id": 1,
			"lookup_profile": "default",
			"lookup_field": "data_header.callid",
			"lookup_range": [-300, 200]
		}
	]	
`)

var CorrelationMapping34default = json.RawMessage(`[
		{
			"source_field": "sid",
			"lookup_id": 1,
			"lookup_profile": "call",
			"lookup_field": "data_header.callid",
			"lookup_range": [-300, 200]
		}
	]
`)

var CorrelationMapping5default = json.RawMessage(`[
		{
			"source_field": "sid",
			"lookup_id": 1,
			"lookup_profile": "call",
			"lookup_field": "data_header.callid",
			"lookup_range": [-300, 200]
		}
	]
`)

var CorrelationMapping1000default = json.RawMessage(`[
		{
			"source_field": "sid",
			"lookup_id": 1,
			"lookup_profile": "call",
			"lookup_field": "data_header.callid",
			"lookup_range": [-300, 200]
		}
	]
`)
