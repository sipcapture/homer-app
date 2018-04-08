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
  
    console.log("PAYLOAD", payload.search);
    let sData = payload.search;
    let dataWhereRawKey = [];
    let dataWhereRawValue = [];
    let dataWhere = {};
    
    //knex.raw("info#>>'{owner,firstName}'"),'LIKE','%john%'
    
    for(var key in sData) {
          let res = key.split(":",3);          
          console.log(key);
          table = "hep_proto_"+res[0]+"_"+res[1];
          let elem = res[2];
          
          console.log("EL", elem);
          if (elem.indexOf('.') > -1)
          {          
              let elemArray = elem.split(".");                    
              console.log("ELEM", elemArray);              
              dataWhereRawKey.push("()::string")
              
          }          
          else {
            dataWhere[elem] = sData[key];
          }
    };   
    
      
    return this.dataDb(table)
      .whereRaw('(protocol_header->>\'payloadType\')::int = ? ', this.param)
      .select(columns)
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
