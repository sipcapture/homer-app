package jsonschema

import (
	"encoding/json"

	"golang.org/x/crypto/bcrypt"
)

var DashboardHome = json.RawMessage(`{"id":"home","name":"Home","alias":"home","selectedItem":"","title":"Home","weight":10,"widgets":[{"x":0,"y":0,"cols":2,"rows":1,"name":"clock","title":"clock","id":"clock214","output":{},"config":{"id":"clock214","datePattern":"YYYY-MM-DD","location":{"value":-60,"offset":"+1","name":"GMT+1 CET","desc":"Central European Time"},"showseconds":false,"timePattern":"HH:mm:ss","title":"Home Clock"}},{"x":0,"y":1,"cols":2,"rows":3,"name":"display-results","title":"display-results","id":"display-results370","output":{},"config":{"id":"display-results370","title":"CALL SIP SEARCH","group":"Search","name":"protosearch","description":"Display Search Form component","refresh":false,"sizeX":2,"sizeY":2,"config":{"title":"CALL SIP SEARCH","searchbutton":true,"protocol_id":{"name":"SIP","value":1},"protocol_profile":{"name":"call","value":"call"}},"uuid":"ed426bd0-ff21-40f7-8852-58700abc3762","fields":[{"field_name":"data_header.from_user","hepid":1,"name":"1:call:data_header.from_user","selection":"SIP From user","type":"string"},{"field_name":"data_header.to_user","hepid":1,"name":"1:call:data_header.to_user","selection":"SIP To user","type":"string"},{"field_name":"data_header.method","hepid":1,"name":"1:call:data_header.method","selection":"SIP Method","type":"string"},{"field_name":"data_header.callid","hepid":1,"name":"1:call:data_header.callid","selection":"SIP Callid","type":"string"},{"field_name":"limit","hepid":1,"name":"1:call:limit","selection":"Query Limit","type":"string"},{"field_name":"targetResultsContainer","hepid":1,"name":"1:call:targetResultsContainer","selection":"Results Container","type":"string"}],"row":0,"col":1,"cols":2,"rows":2,"x":0,"y":1,"protocol_id":{"name":"SIP","value":100}}},{"x":2,"y":0,"cols":4,"rows":4,"name":"result","title":"result","id":"result560","output":{}}],"config":{"margins":[10,10],"columns":"6","pushing":true,"draggable":{"handle":".box-header"},"resizable":{"enabled":true,"handles":["n","e","s","w","ne","se","sw","nw"]}}}`)

var CorrelationMappingdefault = json.RawMessage(`{"source_field": "data_header.callid",
      "lookup_id": 0,
      "lookup_type": "pubsub",
      "lookup_profile": "cdr",
      "lookup_field": "{\"data\":$source_field,\"fromts\":$fromts,\"tots\":$tots}",
	  "lookup_range": [-300, 200]}`)

var EmptyJson = json.RawMessage(`{}`)

var DefaultAdminPassword, _ = bcrypt.GenerateFromPassword([]byte("sipcapture"), bcrypt.DefaultCost)
var DefaultSupportPassword, _ = bcrypt.GenerateFromPassword([]byte("sipcapture"), bcrypt.DefaultCost)

var GrafanaConfig = json.RawMessage(`{"host": "http://grafana:3000","user": "admin","password":"admin","token": "ABCDEFGHKLMN"}`)

var PrometheusConfig = json.RawMessage(`{"host":"http://prometheus:9090/api/v1/"}`)

var LokiConfig = json.RawMessage(`{"host":"http://loki:3100"}`)

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
	  "position": 5,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "data_header.to_user",
	  "name": "SIP To user",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 6,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.srcIp",
	  "name": "Source IP",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 7,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.srcPort",
	  "name": "Src Port",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 8,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.dstIp",
	  "name": "Destination IP",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 9,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.dstPort",
	  "name": "Dst Port",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 10,
	  "skip": false,
	  "hide": false
	},
	{
	  "id": "protocol_header.timeSeconds",
	  "name": "Timeseconds",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 11,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.timeUseconds",
	  "name": "Usecond time",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 12,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.payloadType",
	  "name": "Payload type",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 13,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.protocolFamily",
	  "name": "Proto Family",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 14,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.protocol",
	  "name": "Protocol Type",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 15,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.captureId",
	  "name": "Capture ID",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 16,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "protocol_header.capturePass",
	  "name": "Capture Pass",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 17,
	  "skip": true,
	  "hide": true
	},
	{
	  "id": "data_header.cseq",
	  "name": "SIP Cseq",
	  "type": "integer",
	  "index": "none",
	  "form_type": "input",
	  "position": 18,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "data_header.from_tag",
	  "name": "SIP From tag",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 19,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "data_header.protocol",
	  "name": "SIP Protocol",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 20,
	  "skip": false,
	  "hide": true
	},
	{
	  "id": "raw",
	  "name": "SIP RAW",
	  "type": "string",
	  "index": "none",
	  "form_type": "input",
	  "position": 21,
	  "skip": true,
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
    "type": "integer",
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
  [
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
      "id": "protocol_header.payloadType",
      "name": "Payload type",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 9,
      "skip": false,
      "hide": true
    },
    {
      "id": "protocol_header.captureId",
      "name": "Capture ID",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 10,
      "skip": false,
      "hide": true
    },
    {
      "id": "protocol_header.capturePass",
      "name": "Capture Pass",
      "type": "string",
      "index": "none",
      "form_type": "input",
      "position": 12,
      "skip": true,
      "hide": true
    },
    {
      "id": "protocol_header.protocolFamily",
      "name": "Proto Family",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 13,
      "skip": false,
      "hide": true
    },
    {
      "id": "protocol_header.protocol",
      "name": "Protocol Type",
      "type": "integer",
      "index": "none",
      "form_type": "input",
      "position": 14,
      "skip": false,
      "hide": true
    },
    {
      "id": "raw",
      "name": "RAW",
      "type": "string",
      "index": "none",
      "form_type": "input",
      "position": 15,
      "skip": true,
      "hide": true
    }
  ],
  [
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
      "type": "integer",
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
  ]
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
    "id": "protocol_header.port",
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
    "id": "data_header.medium",
    "name": "Data Medium",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 7,
    "skip": false,
    "hide": true
  },
  {
    "id": "data_header.source",
    "name": "Data Source",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 8,
    "skip": false,
    "hide": false
  },
  {
    "id": "data_header.session",
    "name": "Data Session",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 9,
    "skip": false,
    "hide": false
  },
  {
    "id": "raw",
    "name": "RAW",
    "type": "string",
    "index": "none",
    "form_type": "input",
    "position": 10,
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

var CorrelationMapping1default = json.RawMessage(`[
		{
			"source_field": "data_header.callid",
			"lookup_id": 100,
			"lookup_profile": "default",
			"lookup_field": "sid",
			"lookup_range": [-300, 200]
		},
		{
			"source_field": "data_header.callid",
			"lookup_id": 5,
			"lookup_profile": "default",
			"lookup_field": "sid",
			"lookup_range": [-300, 200]
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
