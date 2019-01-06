import LivingBeing from './living_being';
import { forEach, isEmpty, size } from 'lodash';

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
  select * from hep where (hep_header->>'payloadType')::int = 1 limit 1;
  return knex('books').select(knex.raw("data->'author' as author"))
    .whereRaw("data->'author'->>'first_name'=? ",[books[0].author.first_name])
  */
  getRemoteData(columns, table, data) {
    let sData = data.param.search;
    let dataWhereRawKey = [];
    let dataWhereRawValue = [];
    let dataWhere = {};
    
    /* jshint -W089 */
    
    for (let key in sData) {
      table = 'hep_proto_'+key;
      if (sData.hasOwnProperty(key)) {
        let elems = sData[key];
        forEach(elems, function(el) {
          if (!isEmpty(el.value)) {
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
      
      
      if(doexp) return dataRow;
            
      const globalReply = await this.getTransactionSummary(dataRow);
      
      return globalReply;
    } catch (err) {
      throw new Error('fail to get data main:'+err);
    }
  }  
}

export default RemoteData;
