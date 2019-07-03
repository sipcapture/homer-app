import LivingBeing from './living_being';
import {forEach, isEmpty, size} from 'lodash';
import RemoteData from './remotedata';

/**
 * A class to handle users in DB
 */
class SearchData extends LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} param of search
   */
  constructor(server, param) {
    super({db: server.databases.data, param});
    this.param = param;
    this.server = server;
    this.dataDb = server.databases.data;
  }

  /*
  select * from hep where (hep_header->>'payloadType')::int = 1 limit 1;
  return knex('books').select(knex.raw("data->'author' as author"))
    .whereRaw("data->'author'->>'first_name'=? ",[books[0].author.first_name])
  */
  getSearchData(columns, table, data) {
    let sData = data.param.search;
    let sLimit = data.param.limit;
    let dataWhereRawKey = [];
    let dataWhereRawValue = [];
    let dataWhere = {};

    /* jshint -W089 */
    


    for (let key in sData) {
      table = 'hep_proto_'+key;

      if (sData.hasOwnProperty(key)) {
        let elems = sData[key];        
        forEach(elems, function(el) {        
          if (!isEmpty(el.value) || !isNaN(el.value)) {          
            if (el.name.indexOf('.') > -1) {
              let elemArray = el.name.split('.');
              if (el.type == 'integer') {
                dataWhereRawKey.push('('+elemArray[0]+'->>?)::int = ?');
                dataWhereRawValue.push(elemArray[1], el.value);
              } else {
                let eqValue = '=';
                if (el.value.indexOf('%') > -1) eqValue=' LIKE ';
                dataWhereRawKey.push(elemArray[0]+'->>?'+eqValue+'?');
                dataWhereRawValue.push(elemArray[1], el.value);
              }
            } else if (isNaN(el.value) && el.value.indexOf('%') > -1 ) {
              dataWhereRawKey.push(el.name+' LIKE ?');
              dataWhereRawValue.push(el.value);
            } else {
              /* system fields */
              if(el.name == 'limit') {
                  sLimit = el.value;
              }
              else {
                  dataWhere[el.name] = el.value;
              }
            }
          }
        });
      }
    };

    let timeWhere = [];

    timeWhere.push(new Date(data.timestamp.from).toISOString());
    timeWhere.push(new Date(data.timestamp.to).toISOString());

    let myWhereRawString = '';
    if (!isEmpty(dataWhereRawKey)) {
      myWhereRawString = dataWhereRawKey.join(' AND ');
    }

    /*
    this.dataDb.on( 'query', function( queryData ) {
        console.log( queryData );
    });
    */

    return this.dataDb(table)
      .whereRaw(myWhereRawString, dataWhereRawValue)
      .where(dataWhere)
      .whereBetween('create_date', timeWhere)
      .select(columns)
      .column(this.dataDb.raw('ROUND(EXTRACT(epoch FROM create_date)*1000) as create_date'))
      .limit(sLimit)
      .then(function(rows) {
        let dataReply = [];
        let dataKeys = [];

        rows.forEach(function(row) {
          let dataElement = {};
          for (let k in row) {
            if (k == 'protocol_header' || k == 'data_header') {
              Object.assign(dataElement, row[k]);
            } else {
              dataElement[k] = row[k];
            }
          }
          dataElement['table'] = table;
          dataReply.push(dataElement);
          let keys = Object.keys(dataElement);
          dataKeys = dataKeys.concat(keys.filter(function(i) {
            return dataKeys.indexOf(i) == -1;
          }));
        });

        let globalReply = {
          total: size(dataReply),
          data: dataReply,
          keys: dataKeys,
        };

        return globalReply;
      });
  }

  getMessageById(columns, table, data) {
    let sData = data.param.search;
    let sLimit = data.param.limit;
    let dataWhere = {};

    /* jshint -W089 */
    for (let key in sData) {
      table = 'hep_proto_'+key;
      if (sData.hasOwnProperty(key)) {
        dataWhere = Object.assign({}, dataWhere, sData[key]);
      }
    };

    let timeWhere = [];
    timeWhere.push(new Date(data.timestamp.from).toISOString());
    timeWhere.push(new Date(data.timestamp.to).toISOString());

    return this.dataDb(table)
      .where(dataWhere)
      .whereBetween('create_date', timeWhere)
      .select(columns)
      .column(this.dataDb.raw('ROUND(EXTRACT(epoch FROM create_date)*1000) as create_date'))
      .limit(sLimit)
      .then(function(rows) {
        let dataReply = [];
        let dataKeys = [];

        rows.forEach(function(row) {
          let dataElement = {};
          for (let k in row) {
            if (k == 'protocol_header' || k == 'data_header') {
              Object.assign(dataElement, row[k]);
            } else {
              dataElement[k] = row[k];
            }
          }
          dataReply.push(dataElement);
          let keys = Object.keys(dataElement);
          dataKeys = dataKeys.concat(keys.filter(function(i) {
            return dataKeys.indexOf(i) == -1;
          }));
        });

        let globalReply = {
          total: size(dataReply),
          data: dataReply,
          keys: dataKeys,
        };

        return globalReply;
      });
  }

  async getTransactionSummary(data) {
    try {
      let dataReply = [];
      let dataKeys = [];
      let sid = {};
      let hosts = {};
      let alias = {};
      let callData = [];
      let position = 0;

      data.forEach(function(row) {
        let dataElement = {};
        for (let k in row) {
          if (k == 'protocol_header' || k == 'data_header') {
            Object.assign(dataElement, row[k]);
          } else if (k == 'sid' || k == 'correlation_id') {
            dataElement[k] = row[k];
            sid[row[k]] = row[k];
          } else {
            dataElement[k] = row[k];
          }
        }

        let callElement = {
          id: 0,
          sid: '12345',
          dstHost: '127.0.0.1',
          srcHost: '127.0.0.1',
          dstId: '127.0.0.1:5060',
          srcId: '127.0.0.1:5060',
          srcIp: '127.0.0.1',
          dstIp: '127.0.0.2',
          srcPort: 0,
          dstPort: 0,
          method: 'Generic',
          method_text: 'generic',
          create_date: 0,
          protocol: '1',
          msg_color: 'blue',
          ruri_user: '',
          destination: 0,
        };

        if (dataElement.hasOwnProperty('payloadType')) {
          if (dataElement['payloadType'] == 81) {
            callElement.method = 'CDR';
            callElement.method_text = 'CDR';
          } else if (dataElement['payloadType'] == 100) {
            callElement.method = 'LOG';
            callElement.method_text = 'LOG';
          } else if (dataElement['payloadType'] == 5) {
            callElement.method = 'RTCP';
            callElement.method_text = 'RTCP';
          } else if (dataElement['payloadType'] == 34) {
            callElement.method = 'Report RTP';
            callElement.method_text = 'Report RTP';
          } else if (dataElement['payloadType'] == 200) {
            callElement.method = 'Loki Data';
            callElement.method_text = 'Loki Data';
          } else if (dataElement['payloadType'] == 35) {
            callElement.method = 'Report RTP';
            callElement.method_text = 'Report RTP';
          }
        }

        if (!dataElement.hasOwnProperty('srcIp')) {
          dataElement['srcIp'] = '127.0.0.1';
          dataElement['srcPort'] = 0;
        }

        if (!dataElement.hasOwnProperty('dstIp')) {
          dataElement['dstIp'] = '127.0.0.2';
          dataElement['dstPort'] = 0;
        }

        if (dataElement.hasOwnProperty('id')) callElement.id = dataElement['id'];
        if (dataElement.hasOwnProperty('srcIp')) {
          callElement.srcIp = dataElement['srcIp'];
          callElement.srcHost = dataElement['srcIp'];
        }


        if (dataElement.hasOwnProperty('dstIp')) {
          callElement.dstIp = dataElement['dstIp'];
          callElement.dstHost = dataElement['dstIp'];
        }
        if (dataElement.hasOwnProperty('srcPort')) callElement.srcPort = dataElement['srcPort'];
        if (dataElement.hasOwnProperty('dstPort')) callElement.dstPort = dataElement['dstPort'];
        if (dataElement.hasOwnProperty('method')) {
          callElement.method = dataElement['method'];
          callElement.method_text = dataElement['method'];
        }
        if (dataElement.hasOwnProperty('event')) {
          callElement.method = dataElement['event'];
          callElement.method_text = dataElement['event'];
        }
        if (dataElement.hasOwnProperty('create_date')) {
          callElement.create_date = dataElement['create_date'];
        }
        if (dataElement.hasOwnProperty('create_date')) {
          callElement.micro_ts = dataElement['create_date'];
        }
        if (dataElement.hasOwnProperty('protocol')) {
          callElement.protocol = dataElement['protocol'];
        }
        if (dataElement.hasOwnProperty('sid')) callElement.sid = dataElement['sid'];
        if (dataElement.hasOwnProperty('raw')) {
          callElement.ruri_user = dataElement['raw'].substr(0, 50);
        }

        callElement.srcId = callElement.srcHost+':'+callElement.srcPort;
        callElement.dstId = callElement.dstHost+':'+callElement.dstPort;
        let srcIpPort = callElement.srcIp+':'+callElement.srcPort;
        let dstIpPort= callElement.dstIp+':'+callElement.dstPort;

        if (!hosts.hasOwnProperty(callElement.srcId)) {
          let hostElement = {
            hosts: [callElement.srcId],
            position: position++,
          };

          hosts[callElement.srcId] = hostElement;
        }

        if (!hosts.hasOwnProperty(callElement.dstId)) {
          let hostElement = {
            hosts: [callElement.dstId],
            position: position++,
          };

          hosts[callElement.dstId] = hostElement;
        }

        if (!alias.hasOwnProperty(srcIpPort)) alias[srcIpPort] = callElement.srcId;
        if (!alias.hasOwnProperty(dstIpPort)) alias[dstIpPort] = callElement.dstId;

        callElement.destination = hosts[callElement.dstId].position;

        callData.push(callElement);
        dataReply.push(dataElement);
        let keys = Object.keys(dataElement);
        dataKeys = dataKeys.concat(keys.filter(function(i) {
          return dataKeys.indexOf(i) == -1;
        }));
      });

      let globalReply = {

        total: size(dataReply),
        data: {
          messages: dataReply,
          sid: sid,
          hosts: hosts,
          calldata: callData,
          alias: alias,
        },
        keys: dataKeys,
      };

      return globalReply;
    } catch (err) {
      throw new Error('fail to get data full'+err);
    }
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
  
  async getTransactionDataRaw(table, columns, fieldKey, dataWhere, timeWhere) {
    try {
      return await this.dataDb(table)
        .whereRaw(fieldKey, dataWhere)
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
      let inputObject = {};      

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
      
      dataRow.sort(function(a, b) {
        return a.create_date - b.create_date;
      });

      if (!isEmpty(correlation)) {
        dataRow.forEach(function(row) {
          /* looping over correlation object and extraction keys */
          correlation.forEach(function(corrs) {
            let sf = corrs['source_field'];
            
            if(corrs['lookup_match_field'] && corrs['lookup_match_value']) 
            {
                  let lmField = corrs['lookup_match_field'];  
                  let lmValues = corrs['lookup_match_value'];                                    
                  let expLookupValue;
                  
                  if (lmField.indexOf('.') > -1) 
                  {
                      let emArray = lmField.split('.', 2);
                      expLookupValue = row[emArray[0]][emArray[1]];
                  } else {
                      expLookupValue = row[lmField];
                  }  
                                                                                                                        
                  if(lmValues.includes(expLookupValue)) 
                  {
                        return;
                  }                  
            }

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
            
              if(dataSrcField[sf].length > 0 && corrs['lookup_match_first']) return;
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
      const remotedata = new RemoteData(this.server, this.param);

      for (let corrs of correlation) {
        let sourceField = corrs['source_field'];
        let lookupId = corrs['lookup_id'];
        let lookupProfile = corrs['lookup_profile'];
        let lookupField = corrs['lookup_field'];
        let lookupRange = corrs['lookup_range'];
        const newDataWhere=[];
        timeWhere = [];

        let newDataRow=[];
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

        /* continue if lookup == 0 */
        if (lookupId == 0) {
          let searchPayload = {
            param: {},
            timestamp: {},
          };

          searchPayload.param['server'] = lookupProfile;
          searchPayload.param['limit'] = 100;
          searchPayload.param['search'] = lookupField;
          searchPayload.timestamp['from'] = tFrom.getTime();
          searchPayload.timestamp['to'] = tTo.getTime();

          if (corrs.hasOwnProperty('callid_function')) {
            let callIdFunction = new Function('data', corrs.callid_function);
            let callIdArray = callIdFunction(dataWhere);
            searchPayload.param['search'] = lookupField.replace('$source_field', callIdArray.join('|'));
          }                    

          try {
                    const dataJson = await remotedata.getRemoteData(['id', 'sid', 'protocol_header', 'data_header'], table, searchPayload);
                    newDataRow = JSON.parse(dataJson);

                    if (!isEmpty(newDataRow) && newDataRow.hasOwnProperty('data') && corrs.hasOwnProperty('output_function')) {
                          let outFunction = new Function('data', corrs.output_function);
                          newDataRow = outFunction(newDataRow.data);
                    }                    
          } catch (err) {
              var errorString = new Error('fail to get data in lookup [0]: '+err);
              console.log(errorString);
          }               
         
        } else {
        
            try {        
                /* include the original CALLIDs */
                if(sourceField == "data_header.callid") {
                        newDataWhere = newDataWhere.concat(dataWhere);  
                }
                
                if (corrs.hasOwnProperty('input_function')) {
                    let inputIdFunction = new Function('data', corrs.input_function);
                    let extraIdArray = inputIdFunction(newDataWhere);
                    newDataWhere = extraIdArray;
                }

                /* JSON */
                if (lookupField.indexOf('->>') > -1) 
                {
                      let lookupCast = "varchar";                      
                      if(corrs['lookup_field_cast']) lookupCast=corrs['lookup_field_cast'];
                
                      let emArray = lookupField.split('->>', 2);
                      let strQuestion = "?,";
                      let fadKey = "cast("+emArray[0]+"->>? as "+lookupCast+") IN ("+strQuestion.repeat((newDataWhere.length-1))+"?)";
                      let fadValue = [];
                      fadValue.push(emArray[1]);                      
                      fadValue = fadValue.concat(newDataWhere);                                            
                      
                      newDataRow = await this.getTransactionDataRaw(table, columns, fadKey, fadValue, timeWhere);                      
                      
                } else {

                      newDataRow = await this.getTransactionData(table, columns, lookupField, newDataWhere, timeWhere);
                }  
                
            } catch (err) {
              var errorString = new Error('fail to get data in lookup ['+lookupId+']: '+err);
              console.log(errorString);
          }               
        }
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

  async getTransactionQos(columns, table, data) {
    try {
      let sData = data.param.search;
      let dataWhere = [];
      let dataRtcp;
      let dataRtp;
      let myReply = {};

      /* jshint -W089 */

      for (let key in sData) {
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
      let sid = {};
      
      dataRtcp = await this.dataDb("hep_proto_5_default")
        .whereIn('sid', dataWhere)
        .whereBetween('create_date', timeWhere)
        .select(columns)
        .column(this.dataDb.raw('ROUND(EXTRACT(epoch FROM create_date)*1000) as create_date'))
        .then(function(rows) {
          let dataReply = [];

          rows.forEach(function(row) {
            let dataElement = {};
            for (let k in row) {
              if (k == 'protocol_header' || k == 'data_header') {
                Object.assign(dataElement, row[k]);
              } else if (k == 'sid' || k == 'correlation_id') {
                dataElement[k] = row[k];
                sid[row[k]] = row[k];
              } else {
                dataElement[k] = row[k];
              }
            }

            dataReply.push(dataElement);
          });

          let globalReply = {
            total: size(dataReply),
            data: dataReply,
          };

          return globalReply;
        });
        
       dataRtp = await this.dataDb("hep_proto_35_default")
        .whereIn('sid', dataWhere)
        .whereBetween('create_date', timeWhere)
        .select(columns)
        .column(this.dataDb.raw('ROUND(EXTRACT(epoch FROM create_date)*1000) as create_date'))
        .then(function(rows) {
          let dataReply = [];

          rows.forEach(function(row) {
            let dataElement = {};
            for (let k in row) {
              if (k == 'protocol_header') {
                Object.assign(dataElement, row[k]);
              }
              else if (k == 'data_header') {

                if((!row['data_header'] || Object.keys(row['data_header']).length < 50) && row["raw"])
                {
                    row['data_header'] = JSON.parse(row["raw"]);
                }
                
                Object.assign(dataElement, row[k]);                
              }
               else if (k == 'sid' || k == 'correlation_id') {
                dataElement[k] = row[k];
                sid[row[k]] = row[k];
              } else if (k == 'raw') {
                    if((!row[k] || row[k].length < 50) && row["data_header"])
                    {
                        Object.assign(dataElement, JSON.parse(row[k]));
                        row[k] = JSON.stringify(row["data_header"]);                        
                    }                                                    
                    
                    dataElement[k] = row[k];
              } else {
                dataElement[k] = row[k];
              }
            }

            dataReply.push(dataElement);
          });

          let globalReply = {
            total: size(dataReply),
            data: dataReply,
          };

          return globalReply;
        });
        
        
        myReply['rtcp'] = dataRtcp;
        myReply['rtp'] = dataRtp;
                
        return myReply; 
        
    } catch (err) {
      throw new Error('fail to get data QOS '+err);
    }
  }


  async getTransactionLog(columns, table, data) {
    try {
      let sData = data.param.search;
      let dataWhere = [];

      /* jshint -W089 */

      for (let key in sData) {
        table = 'hep_proto_100_default';
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
      let sid = {};

      return await this.dataDb(table)
        .whereIn('sid', dataWhere)
        .whereBetween('create_date', timeWhere)
        .select(columns)
        .column(this.dataDb.raw('ROUND(EXTRACT(epoch FROM create_date)*1000) as create_date'))
        .then(function(rows) {
          let dataReply = [];

          rows.forEach(function(row) {
            let dataElement = {};
            for (let k in row) {
              if (k == 'protocol_header' || k == 'data_header') {
                Object.assign(dataElement, row[k]);
              } else if (k == 'sid' || k == 'correlation_id') {
                dataElement[k] = row[k];
                sid[row[k]] = row[k];
              } else {
                dataElement[k] = row[k];
              }
            }

            dataReply.push(dataElement);
          });

          let globalReply = {
            total: size(dataReply),
            data: dataReply,
          };

          return globalReply;
        });
    } catch (err) {
      throw new Error('fail to get data QOS '+err);
    }
  }
  
  async getHepSubData(remoteAgents) {
    try {

      let dataWhere = [];
      let allDataRow = [];
      
      //console.log("MAPHEP", remoteAgents);
      
      /* jshint -W089 */

      for (let key in remoteAgents) {
                
        
          let param = [];                    
          let agent = remoteAgents[key];
          let serverUrl = "http://"+agent['host']+":"+agent['port'];
          let serverApi = agent['path']+"/"+agent['type'];
          let serverNode = agent['node'];
          let query = agent['query'];
          let dataLog = {};

          /* correlation requests */
          const remotedata = new RemoteData(this.server, this.param);
          const dataHepSub = await remotedata.getRemoteHepSubData(serverUrl, serverApi, query);
          dataLog['node'] =  serverNode;
          dataLog['data'] =  dataHepSub;                
          allDataRow = allDataRow.concat(dataLog);                                  
      };
      
      let globalReply = {
            total: size(allDataRow),
            data: allDataRow,
      };
      
      return globalReply;
      
    } catch (err) {
      throw new Error('fail to get data HepSub '+err);
    }
  }
  
}

export default SearchData;
