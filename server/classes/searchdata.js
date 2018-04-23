import LivingBeing from './living_being';

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
    this.param = 1;
    this.dataDb = server.databases.data;
  }

  /*
  select * from hep where (hep_header->>'payloadType')::int = 1 limit 1;
  return knex('books').select(knex.raw("data->'author' as author"))
    .whereRaw("data->'author'->>'first_name'=? ",[books[0].author.first_name])
  */
  getSearchData(columns, table, data) {
  
    let sData = data.param.search;
    let dataWhereRawKey = [];
    let dataWhereRawValue = [];
    let dataWhere = {};
    
    /* jshint -W089 */
    
    for (let key in sData) {
      table = 'hep_proto_'+key;
      if (sData.hasOwnProperty(key)) {
        let elems = sData[key];
        elems.forEach(function(el) {
          if (el.value.length > 0) {
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
            } else if (el.value.indexOf('%') > -1 ) {
              dataWhereRawKey.push(el.name+' LIKE ?');
              dataWhereRawValue.push(el.value);
            } else {
              dataWhere[el.name] = el.value;
            }
          }
        });
      }
    };

    console.log("TimERange", data.timestamp);
    let timeWhere = [];
    
    timeWhere.push(new Date(data.timestamp.from).toISOString());
    timeWhere.push(new Date(data.timestamp.to).toISOString());
    
    let myWhereRawString = '';
    if (dataWhereRawKey.length > 0 ) {
      myWhereRawString = dataWhereRawKey.join(' AND ');
    }
    
    this.dataDb.on( 'query', function( queryData ) {
        console.log( queryData );
    });
    
      
    return this.dataDb(table)
      .whereRaw(myWhereRawString, dataWhereRawValue)
      .where(dataWhere)
      .whereBetween('create_date',timeWhere)
      .select(columns)
      .column(this.dataDb.raw('ROUND(EXTRACT(epoch FROM create_date)*1000) as create_date'))
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
          total: dataReply.length,
          data: dataReply,
          keys: dataKeys,
        };
        
        return globalReply;
      });
  }
  
  getMessageById(columns, table, data) {
  
    let sData = data.param.search;
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
      .whereBetween('create_date',timeWhere)
      .select(columns)
      .column(this.dataDb.raw('ROUND(EXTRACT(epoch FROM create_date)*1000) as create_date'))
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
          total: dataReply.length,
          data: dataReply,
          keys: dataKeys,
        };
        
        return globalReply;
      });
  }
  
  
  getTransaction(columns, table, payload) {
    let sData = payload.search;
    let dataWhere = [];
    
    /* jshint -W089 */
  
    for (let key in sData) {
      table = 'hep_proto_'+key;
      if (sData.hasOwnProperty(key)) {        
        dataWhere = sData[key]['callid'];
      }
    };
    
    /*
    this.dataDb.on( 'query', function( queryData ) {
        console.log( queryData );
    });
    */
      
    return this.dataDb(table)
      .whereIn('sid', dataWhere)
      .select(columns)
      .column(this.dataDb.raw('ROUND(EXTRACT(epoch FROM create_date)*1000) as create_date'))
      .then(function(rows) {
        let dataReply = [];
        let dataKeys = [];
        let sid = {};
        let hosts = {};
        let alias = {};
        let callData = [];
        let position = 0;
        
        rows.forEach(function(row) {
          let dataElement = {};
          for (let k in row) {
            if (k == 'protocol_header' || k == 'data_header') {
              Object.assign(dataElement, row[k]);
            }
            else if (k == 'sid' || k == 'correlation_id') {
              dataElement[k] = row[k];
              sid[row[k]] = row[k];
            }
             else {
              dataElement[k] = row[k];
            }            
          }
          
          let callElement = {
              id: 0,
              sid: "12345",
              dstHost: "127.0.0.1",
              srcHost: "127.0.0.1",
              dstId: "127.0.0.1:5060",
              srcId: "127.0.0.1:5060",
              srcIp: "127.0.0.1",
              dstIp: "127.0.0.2",
              srcPort:0,
              dstPort:0,
              method: "UNKNOWN",
              method_text: "UNKNOWN",
              create_date: 0,
              protocol: "1",
              msg_color: "blue",
              ruri_user: "",
              destination: 0,            
          }

          if(dataElement.hasOwnProperty("id")) callElement.id = dataElement["id"];
          if(dataElement.hasOwnProperty("srcIp")) {
                callElement.srcIp = dataElement["srcIp"];
                callElement.srcHost = dataElement["srcIp"];
          }
          if(dataElement.hasOwnProperty("dstIp")) {
              callElement.dstIp = dataElement["dstIp"];
              callElement.dstHost = dataElement["dstIp"];
          }
          if(dataElement.hasOwnProperty("srcPort")) callElement.srcPort = dataElement["srcPort"];
          if(dataElement.hasOwnProperty("dstPort")) callElement.dstPort = dataElement["dstPort"];          
          if(dataElement.hasOwnProperty("method")) {
                  callElement.method = dataElement["method"];
                  callElement.method_text = dataElement["method"];
          }                    
          if(dataElement.hasOwnProperty("create_date")) {
                  callElement.create_date = dataElement["create_date"];
          }          
          if(dataElement.hasOwnProperty("create_date")) {
                  callElement.micro_ts = dataElement["create_date"];
          }         
          if(dataElement.hasOwnProperty("protocol")) {
                  callElement.protocol = dataElement["protocol"];
          }          
          if(dataElement.hasOwnProperty("sid")) callElement.sid = dataElement["sid"];
          if(dataElement.hasOwnProperty("raw")) {
                callElement.ruri_user = dataElement["raw"].substr(0,20);
          }

          callElement.srcId = callElement.srcHost+":"+callElement.srcPort;
          callElement.dstId = callElement.dstHost+":"+callElement.dstPort;
          let srcIpPort = callElement.srcIp+":"+callElement.srcPort;
          let dstIpPort= callElement.dstIp+":"+callElement.dstPort;
                    
          if(!hosts.hasOwnProperty(callElement.srcId)) 
          {
                let hostElement = {
                      hosts: [ callElement.srcId],  
                      position: position++,
                };

                hosts[callElement.srcId] = hostElement;                                                    
          }
          
          if(!hosts.hasOwnProperty(callElement.dstId)) 
          {
                let hostElement = {
                      hosts: [ callElement.dstId],  
                      position: position++,
                };
                
                hosts[callElement.dstId] = hostElement;                                                    
          }
          
          if(!alias.hasOwnProperty(srcIpPort)) alias[srcIpPort] = callElement.srcId;
          if(!alias.hasOwnProperty(dstIpPort)) alias[dstIpPort] = callElement.dstId;

          callElement.destination = hosts[callElement.dstId].position;
          
          callData.push(callElement);
          dataReply.push(dataElement);
          let keys = Object.keys(dataElement);
          dataKeys = dataKeys.concat(keys.filter(function(i) {
            return dataKeys.indexOf(i) == -1;
          }));
        });
        
        let globalReply = {
          total: dataReply.length,
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
      });
  }
  
}

export default SearchData;
