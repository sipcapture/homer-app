import LivingBeing from './living_being';
import Log from './log';

//const log = new Log(server, 'searchdata');
const table = 'hep';

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
    super({db: server.databases.data, table, param});
    this.param = 1;
    this.dataDb = server.databases.data;
  }

  /*
  select * from hep where (hep_header->>'payloadType')::int = 1 limit 1;
  return knex('books').select(knex.raw("data->'author' as author"))
    .whereRaw("data->'author'->>'first_name'=? ",[books[0].author.first_name])
  */
  get(columns) {
    return this.dataDb(table)
      .whereRaw('(hep_header->>\'payloadType\')::int = ? ', this.param)
      .select(columns)
      .then(function(rows) {
        /* log.debug('loading search data');        
        */
        var data_reply = [];               
        var data_keys = [];
        
        rows.forEach(function(row) {

          var data_element = {};
          for (var k in row) {
              if(k == 'hep_header' || k == "payload") { 
                  Object.assign(data_element, row[k]); 
              }
              else {
                    data_element[k] = row[k];
              }          
          }
          data_reply.push(data_element);
          var keys = Object.keys(data_element);        
          data_keys = data_keys.concat(keys.filter(function(i) { return data_keys.indexOf(i) == -1;}));                              
        });        
        
        var global_reply = {
              total: data_reply.length,
              data: data_reply,
              keys: data_keys,
        };        
        
        return global_reply;            
  });
  
 }
}

export default SearchData;
