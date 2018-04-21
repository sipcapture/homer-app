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
  get(columns, table, data) {
  
    console.log("RRR", data.param);
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
    
    timeWhere.push(data.timestamp.from);
    timeWhere.push(data.timestamp.to);
    
    
    
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
    let sData = payload.search.callid;
    let dataWhere = {};
    
    /* jshint -W089 */
  
    sData.forEach(function(el) {
          dataWhere['sid'] = el;
    });
    
    /*
    this.dataDb.on( 'query', function( queryData ) {
        console.log( queryData );
    });
    */
      
    return this.dataDb(table)
      .orWhere(dataWhere)
      .select(columns)
      .column(this.dataDb.raw('ROUND(EXTRACT(epoch FROM create_date)*1000) as create_date'))
      .then(function(rows) {
        let dataReply = [];
        let dataKeys = [];
        let callid = {};
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
              callid[row[k]] = row[k];
            }
             else {
              dataElement[k] = row[k];
            }            
          }
          
          let callElement = {
              id: 0,
              callid: "12345",
              dst_host: "127.0.0.1",
              src_host: "127.0.0.1",
              dst_id: "127.0.0.1:5060",
              src_id: "127.0.0.1:5060",
              source_ip: "127.0.0.1",
              destination_ip: "127.0.0.2",
              src_port:0,
              dst_port:0,
              method: "UNKNOWN",
              method_text: "UNKNOWN",
              micro_ts: 0,
              protocol: "1",
              msg_color: "blue",
              ruri_user: "",
              destination: 0,            
          }

          if(dataElement.hasOwnProperty("id")) callElement.id = dataElement["id"];
          if(dataElement.hasOwnProperty("srcIp")) {
                callElement.source_ip = dataElement["srcIp"];
                callElement.src_host = dataElement["srcIp"];
          }
          if(dataElement.hasOwnProperty("dstIp")) {
              callElement.destination_ip = dataElement["dstIp"];
              callElement.dst_host = dataElement["dstIp"];
          }
          if(dataElement.hasOwnProperty("srcPort")) callElement.src_port = dataElement["srcPort"];
          if(dataElement.hasOwnProperty("dstPort")) callElement.dst_port = dataElement["dstPort"];          
          if(dataElement.hasOwnProperty("method")) {
                  callElement.method = dataElement["method"];
                  callElement.method_text = dataElement["method"];
          }                    
          if(dataElement.hasOwnProperty("create_date")) {
                  callElement.micro_ts = dataElement["create_date"];
          }          
          if(dataElement.hasOwnProperty("create_date")) {
                  callElement.micro_ts = dataElement["create_date"];
          }         
          if(dataElement.hasOwnProperty("protocol")) {
                  callElement.protocol = dataElement["protocol"];
          }          
          if(dataElement.hasOwnProperty("sid")) callElement.callid = dataElement["sid"];
          if(dataElement.hasOwnProperty("raw")) callElement.ruri_user = dataElement["raw"].substr(0,20);

          callElement.src_id = callElement.src_host+":"+callElement.src_port;
          callElement.dst_id = callElement.dst_host+":"+callElement.dst_port;
          let srcIpPort = callElement.source_ip+":"+callElement.src_port;
          let dstIpPort= callElement.destination_ip+":"+callElement.dst_port;
                    
          if(!hosts.hasOwnProperty(callElement.src_id)) 
          {
                let hostElement = {
                      hosts: [ callElement.src_id],  
                      position: position++,
                };

                hosts[callElement.src_id] = hostElement;                                                    
          }
          
          if(!hosts.hasOwnProperty(callElement.dst_id)) 
          {
                let hostElement = {
                      hosts: [ callElement.dst_id],  
                      position: position++,
                };
                
                hosts[callElement.dst_id] = hostElement;                                                    
          }
          
          if(!alias.hasOwnProperty(srcIpPort)) alias[srcIpPort] = callElement.src_id;
          if(!alias.hasOwnProperty(dstIpPort)) alias[dstIpPort] = callElement.dst_id;

          callElement.destination = hosts[callElement.dst_id].position;
          
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
              callid: callid,
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
