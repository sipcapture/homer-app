import LivingBeing from './living_being';
import {forEach, isEmpty, size} from 'lodash';

import fetch from 'node-fetch';

let LOKI_SERVER = 'http://127.0.0.1:3100';


/**
 * A class to handle users in DB
 */
class RemoteData extends LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} param of search
   */
  constructor(server, param) {
    super({db: server.databases.data, param});
    this.param = 1;
    this.dataDb = server.databases.data;
  }

  /*
  Fetch Loki Labels + Values into a tree array
  */
  getRemoteLabelsValues() {
    let LOKI_API = data.param.server;
    const url = LOKI_API + '/api/prom/label';
    let labels = [];
    return fetch(url)
      .then((response) => response.json())
      .then(function(responseJSON) {
        if (!responseJSON.values) return JSON.stringify(dataset);
        responseJSON.values.forEach(function(label) {
          if (!labels[label]) labels[label] = [];
          let valUrl = LOKI_API + '/api/prom/label/'+label+'/values';
          return fetch(valUrl)
            .then((response) => response.json())
            .then(function(responseValues) {
              labels[label] = responseValues.values;
            });
        });
        return JSON.stringify(labels);
      })
      .catch(function(error) {
        console.error(error); return JSON.stringify(labels);
      });
  }

  /*
  Fetch Loki Labels to array
  */
  getRemoteLabels(server) {
    let LOKI_API = server || LOKI_SERVER;
    const url = LOKI_API + '/api/prom/label';
    return fetch(url)
      .then((response) => response.json())
      .then(function(responseJSON) {
        if (!responseJSON.values) return JSON.stringify([]);
        return JSON.stringify(responseJSON.values);
      })
      .catch(function(error) {
        console.error(error); return JSON.stringify([]);
      });
  }

  /*
  Fetch Loki Labels + Values into a tree array
  */
  getRemoteValues(server, label) {
    let LOKI_API = server || LOKI_SERVER;
    const url = LOKI_API + '/api/prom/label/'+label+'/values';
    return fetch(url)
      .then((response) => response.json())
      .then(function(responseJSON) {
        if (!responseJSON.values) return JSON.stringify([]);
        return JSON.stringify(responseJSON.values);
      })
      .catch(function(error) {
        console.error(error); return JSON.stringify([]);
      });
  }

  /*
  Fetch Loki PromQL Results
  */
  getRemoteData(columns, table, data) {
    let sData = data.param.search;
    console.log('IN LogQL', sData);

    let parseQuery = function(input) {
      const selectorRegexp = /(?:^|\s){[^{]*}/g;
      const match = input.match(selectorRegexp);
      let query = '';
      let regexp = input;

      if (match) {
        query = match[0].trim();
        regexp = input.replace(selectorRegexp, '').trim();
      }
      console.log(query, regexp);
      return {query, regexp};
    };

    let fromts = (new Date(data.timestamp.from)).getTime()*1000000;
    let tots = (new Date(data.timestamp.to)).getTime()*1000000;

    let query = parseQuery(sData);
    // var logql =  "query="+query.query
    let logql = 'query='+query.query
    +'&regexp='+query.regexp
    +'&limit='+data.param.limit
    +'&start='+fromts
    +'&end='+tots;

    console.log('OUT LogQL', logql);

    // Fetch
    let LOKI_API = data.param.server || LOKI_SERVER;
    const url = LOKI_API + '/api/prom/query?'+encodeURI(logql);

    let dataset = {'data': [], 'keys': [], 'total': 0};
    dataset.keys = [
      {field: 'micro_ts', displayName: 'Timestamp', maxWidth: 200},
      {field: 'custom_1', displayName: 'Message'},
      {field: 'custom_2', displayName: 'Labels'},
    ];

    return fetch(url)
      .then((response) => response.json())
      .then(function(responseJSON) {
        if (!responseJSON.streams) return JSON.stringify(dataset);
        responseJSON.streams.forEach(function(stream) {
          // console.log(stream.labels);
          stream.entries.forEach(function(entry) {
            dataset.total++;
            dataset.data.push({id: dataset.total, micro_ts: entry.ts, custom_1: entry.line, custom_2: stream.labels});
          });
        });

        return JSON.stringify(dataset);
      })
      .catch(function(error) {
        console.error(error); return JSON.stringify(dataset);
      });
  }


  async getTransactionData(table, columns, fieldKey, dataWhere, timeWhere) {
    try {
      return await this.dataDb(table)
        .whereIn(fieldKey, dataWhere)
        .whereBetween('create_date', timeWhere)
        .select(columns)
        .column(this.dataDb.raw('ROUND(EXTRACT(epoch FROM create_date)*1000) as create_date'))
        .then(function(rows) {
          return rows;
        });
    } catch (err) {
      throw new Error('fail to get data full'+err);
    }
  }


  async getTransaction(columns, table, data, correlation, doexp) {
    try {
      let sData = data.param.search;
      let dataWhere = [];
      let dataSrcField = {};

      /* jshint -W089 */


      for (let key in sData) {
        table = 'hep_proto_'+key;
        if (sData.hasOwnProperty(key)) {
          dataWhere = sData[key]['callid'];
        }
      };

      let timeWhere = [];
      timeWhere.push(new Date(data.timestamp.from).toISOString());
      timeWhere.push(new Date(data.timestamp.to).toISOString());

      /*
    this.dataDb.on( 'query', function( queryData ) {
        console.log( queryData );
    });

   */
      /* MAIN REQUEST */
      let dataRow = await this.getTransactionData(table, columns, 'sid', dataWhere, timeWhere);
      // let dataRow = []

      if (!isEmpty(correlation)) {
        dataRow.forEach(function(row) {
          /* looping over correlation object and extraction keys */
          correlation.forEach(function(corrs) {
            let sf = corrs['source_field'];
            let nKey = null;
            if (sf.indexOf('.') > -1) {
              let elemArray = sf.split('.', 2);
              nKey = row[elemArray[0]][elemArray[1]];
            } else {
              nKey = row[sf];
            }
            if (!dataSrcField.hasOwnProperty(sf)) {
              dataSrcField[sf] = [];
            }
            if (nKey != null && dataSrcField[sf].indexOf(nKey) == -1) {
              dataSrcField[sf].push(nKey);
            }
          });
        });
      }

      /*
    correlation [ { source_field: 'data_header.callid',
    lookup_id: 100,
    lookup_profile: 'default',
    lookup_field: 'sid',
    lookup_range: [ -300, 200 ] } ]
    */

      /* correlation requests */

      for (let corrs of correlation) {
        let sourceField = corrs['source_field'];
        let lookupId = corrs['lookup_id'];
        let lookupProfile = corrs['lookup_profile'];
        let lookupField = corrs['lookup_field'];
        let lookupRange = corrs['lookup_range'];
        let newDataWhere=[];
        timeWhere = [];

        newDataWhere = newDataWhere.concat(dataWhere);
        newDataWhere = newDataWhere.concat(dataSrcField[sourceField]);

        table = 'hep_proto_'+lookupId+'_'+lookupProfile;

        let tFrom = new Date(data.timestamp.from);
        let tTo = new Date(data.timestamp.to);

        if (!isEmpty(lookupRange)) {
          tFrom.setSeconds(tFrom.getSeconds() + lookupRange[0]);
          tTo.setSeconds(tTo.getSeconds() + lookupRange[1]);
        }

        timeWhere.push(tFrom.toISOString());
        timeWhere.push(tTo.toISOString());

        const newDataRow = await this.getTransactionData(table, columns, lookupField, newDataWhere, timeWhere);

        if (!isEmpty(newDataRow)) dataRow = dataRow.concat(newDataRow);
      }

      /* sort it by create data */
      dataRow.sort(function(a, b) {
        return a.create_date - b.create_date;
      });


      if (doexp) return dataRow;

      const globalReply = await this.getTransactionSummary(dataRow);

      return globalReply;
    } catch (err) {
      throw new Error('fail to get data main:'+err);
    }
  }
}

export default RemoteData;
