const DATASOURCES = {
  DATA: {
    'sipcapture': {
      'name': 'Sipcapture',
      'type': 'JSON',
      'alias': 'sipcapture',
      'fields': [{
        name: 'Main Category',
        type: 'select',
        value: 'main',
        data: [{
          name: 'Global',
          value: 'all'
        }, {
          name: 'Calls',
          value: 'calls'
        }, {
          name: 'Calls Attempt',
          value: 'calls_attempt'
        }, {
          name: 'Country attempt',
          value: 'country_attempt'
        }, {
          name: 'Calls country duration',
          value: 'calls_country_duration'
        }, {
          name: 'Calls country IP attempt',
          value: 'calls_country_ip_attempt'
        }, {
          name: 'Calls country IP duration',
          value: 'calls_country_ip_duration'
        }, {
          name: 'Calls country IP MOS',
          value: 'calls_country_ip_mos'
        }, {
          name: 'Calls Country MOS',
          value: 'calls_country_mos'
        }, {
          name: 'Calls country number attempt',
          value: 'calls_country_number_attempt'
        }, {
          name: 'Calls country number duration',
          value: 'calls_country_number_duration'
        }, {
          name: 'Calls country number MOS',
          value: 'calls_country_number_mos'
        }, {
          name: 'Calls country range MOS',
          value: 'calls_country_range_mos'
        }, {
          name: 'Calls duration',
          value: 'calls_duration'
        }, {
          name: 'Calls IP Attempt',
          value: 'calls_ip_attempt'
        }, {
          name: 'Calls IP duration',
          value: 'calls_ip_duration'
        }, {
          name: 'Calls IP MOS',
          value: 'calls_ip_mos'
        }, {
          name: 'Calls IP Range MOS',
          value: 'calls_ip_range_mos'
        }, {
          name: 'Duration',
          value: 'duration'
        }, {
          name: 'Method All',
          value: 'method_all'
        }, {
          name: 'Method calls',
          value: 'method_calls'
        }, {
          name: 'Method Registration',
          value: 'method_registrations'
        }, {
          name: 'Proto',
          value: 'proto'
        }, {
          name: 'Registration',
          value: 'registrations'
        }, {
          name: 'UAC Calls',
          value: 'useragents_calls'
        }, {
          name: 'UAC Registration',
          value: 'useragents_registrations'
        }]
      }, {
        name: 'Counter',
        type: 'select2',
        value: 'type',
        data: [{
          name: 'Total PPS',
          value: 'total_pps'
        }, {
          name: 'Other PPS',
          value: 'other_pps'
        }, {
          name: 'Regs PPS',
          value: 'regs_pps'
        }, {
          name: 'CALLS PPS',
          value: 'calls_pps'
        }, {
          name: 'Canceled',
          value: 'canceled'
        }, {
          name: 'failedsessetup',
          value: 'failedsessetup'
        }, {
          name: 'unauth',
          value: 'unauth'
        }, {
          name: 'finished',
          value: 'finished'
        }]
      }, {
        name: 'Sum',
        type: 'checkbox',
        value: 'sum'
      }, {
        name: 'Limit',
        type: 'input',
        value: 'limit'
      }, {
        name: 'Colors',
        type: 'input',
        value: 'colors'
      }, {
        name: 'Value',
        type: 'input',
        value: 'value'
      }],
      'settings': {
        'path': 'statistic/data',
        'query': '{\n   \'timestamp\': {\n          \'from\': \'@from_ts\',\n          \'to\':  \'@to_ts\'\n   },\n  \'param\': {\n        \'filter\': [ \n             \'@filters\'\n       ],\n       \'limit\': \'@limit\',\n       \'total\': \'@total\'\n   }\n}',
        'method': 'GET',
        'limit': 200,
        'total': false,
        'eval': {
          incoming: {
            name: 'test incoming',
            value: 'var object = @incoming; return object'
          }
        },
        'timefields': [{
          'field': 'from_ts',
          'desc': 'From Timestamp'
        }, {
          'field': 'to_ts',
          'desc': 'To Timestamp'
        }],
        'fieldvalues': [{
          'field': 'total',
          'desc': 'All Packets'
        }],
        'filters': [{
          'type': 'type',
          'desc': 'Data Statistics',
          options: [{
            'value': 'asr',
            'desc': 'Answer Seizure Ratio'
          }, {
            'value': 'ner',
            'desc': 'Network Effectiveness Ratio'
          }, {
            'value': 'packet_size',
            'desc': 'Packet Size'
          }, {
            'value': 'packet_count',
            'desc': 'Packet Count'
          }, {
            'value': 'sdf',
            'desc': 'counter of call’s releases except busy and normal call clearing (17 && 16)'
          }, {
            'value': 'isa',
            'desc': 'counter of replies on INVITE: 408|50[03]'
          }, {
            'value': 'sd',
            'desc': 'counter of replies on INVITE: 50[034]'
          }, {
            'value': 'ssr',
            'desc': 'call success setup rate'
          }]
        }]
      }
    }
  }
};

export default DATASOURCES;
