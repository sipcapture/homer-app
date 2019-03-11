export default {
  DATA: {
    influxdb: {
      name: 'InfluxDB',
      type: 'JSON',
      alias: 'influxdb',
      fields: [
        {
          name: 'Main Category',
          type: 'select-main',
          value: 'main',
          data: [
            {
              name: 'ASR NER',
              value: 'asr_ner',
            },
          ],
        },
        {
          Name: 'Counter',
          Type: 'select2',
          Value: 'type',
          Data: [
            {
              name: 'Total PPS',
              value: 'total_pps',
            },
            {
              name: 'Other PPS',
              value: 'other_pps',
            },
            {
              name: 'Regs PPS',
              value: 'regs_pps',
            },
            {
              name: 'CALLS PPS',
              value: 'calls_pps',
            },
            {
              name: 'Canceled',
              value: 'canceled',
            },
            {
              name: 'failedsessetup',
              value: 'failedsessetup',
            },
            {
              name: 'unauth',
              value: 'unauth',
            },
            {
              name: 'finished',
              value: 'finished',
            },
          ],
        },
        {
          name: 'Tag',
          type: 'selecttag',
          value: 'typetag',
          data: [
            {
              name: 'User Group',
              value: 'tag1',
            },
            {
              name: 'X-Group',
              value: 'tag2',
            },
            {
              name: 'IP Group IN',
              value: 'tag3',
            },
            {
              name: 'IP Group OUT',
              value: 'tag4',
            },
            {
              name: 'Tag 5',
              value: 'tag5',
            },
          ],
        },
        {
          name: 'Group',
          type: 'select3',
          value: 'tag',
          data: [
            {
              name: 'Total PPS',
              value: 'total_pps',
            },
            {
              name: 'Other PPS',
              value: 'other_pps',
            },
            {
              name: 'Regs PPS',
              value: 'regs_pps',
            },
            {
              name: 'CALLS PPS',
              value: 'calls_pps',
            },
            {
              name: 'Canceled',
              value: 'canceled',
            },
            {
              name: 'failedsessetup',
              value: 'failedsessetup',
            },
            {
              name: 'unauth',
              value: 'unauth',
            },
            {
              name: 'finished',
              value: 'finished',
            },
          ],
        },
        {
          name: 'Sum',
          type: 'checkbox',
          value: 'sum',
        },
        {
          name: 'Limit',
          type: 'input',
          value: 'limit',
        },
      ],
      settings: {
        path: 'statistic\/data',
        query: '{\n   "timestamp": {\n          "from": "@from_ts",\n          "to":  "@to_ts"\n   },\n  "param": {\n        "filter": [ \n             "@filters"\n       ],\n       "limit": "@limit",\n       "total": "@total"\n   }\n}',
        method: 'GET',
        limit: 200,
        total: false,
        eval: {
          incoming: {
            name: 'test incoming',
            value: 'var object = @incoming; return object',
          },
        },
        timefields: [
          {
            field: 'from_ts',
            desc: 'From Timestamp',
          },
          {
            field: 'to_ts',
            desc: 'To Timestamp',
          },
        ],
        fieldvalues: [
          {
            field: 'total',
            desc: 'All Packets',
          },
        ],
        filters: [
          {
            type: 'type',
            desc: 'Data Statistics',
            options: [
              {
                value: 'asr',
                desc: 'Answer Seizure Ratio',
              },
              {
                value: 'ner',
                desc: 'Network Effectiveness Ratio',
              },
              {
                value: 'packet_size',
                desc: 'Packet Size',
              },
              {
                value: 'packet_count',
                desc: 'Packet Count',
              },
              {
                value: 'sdf',
                desc: 'counter of call’s releases except busy and normal call clearing (17 && 16)',
              },
              {
                value: 'isa',
                desc: 'counter of replies on INVITE: 408|50[03]',
              },
              {
                value: 'sd',
                desc: 'counter of replies on INVITE: 50[034]',
              },
              {
                value: 'ssr',
                desc: 'call success setup rate',
              },
            ],
          },
        ],
      },
    },
    prometheus: {
      name: 'Prometheus',
      type: 'JSON',
      alias: 'prometheus',
      fields: [
        {
          name: 'Main Category',
          type: 'select-main',
          value: 'main',
          data: [
            {
              name: 'ASR NER',
              value: 'asr_ner',
            },
          ],
        },
        {
          Name: 'Counter',
          Type: 'select2',
          Value: 'type',
          Data: [],
        },
        {
          name: 'Tag',
          type: 'selecttag',
          value: 'typetag',
          data: [],
        },
        {
          name: 'Group',
          type: 'select3',
          value: 'tag',
          data: [],
        },
        {
          name: 'Sum',
          type: 'checkbox',
          value: 'sum',
        },
        {
          name: 'Limit',
          type: 'input',
          value: 'limit',
        },
      ],
      settings: {
        path: 'prometheus\/value',
        query: "{\"timestamp\": {\"from\": \"@from_ts\",\"to\": \"@to_ts\"},\"param\": {\"metrics\": [],\"limit\": \"@limit\",\"total\": \"@total\"}}",
        method: 'GET',
        limit: 200,
        total: false,
        eval: {
          incoming: {
            name: 'test incoming',
            value: 'var object = @incoming; return object',
          },
        },
        timefields: [
          {
            field: 'from_ts',
            desc: 'From Timestamp',
          },
          {
            field: 'to_ts',
            desc: 'To Timestamp',
          },
        ],
        fieldvalues: [
          {
            field: 'total',
            desc: 'All Packets',
          },
        ],
        filters: [],
      },
    },
  },
};
