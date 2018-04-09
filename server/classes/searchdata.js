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
  get(columns, table, payload) {
    let sData = payload.search;
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
    
    let myWhereRawString = '';
    if (dataWhereRawKey.length > 0 ) {
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
}

export default SearchData;
