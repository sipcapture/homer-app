import LivingBeing from './living_being';

/**
 * A class to handle users in DB
 */
class MappingData extends LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} param of search
   */
  constructor(server, param) {
    super({db: server.databases.config, param});
    this.param = 1;
    this.dataDb = server.databases.config;
  }

  /*
  select * from hep where (hep_header->>'payloadType')::int = 1 limit 1;
  return knex('books').select(knex.raw("data->'author' as author"))
    .whereRaw("data->'author'->>'first_name'=? ",[books[0].author.first_name])
  */
  getProtocols(table) {
    return this.dataDb(table)
      .where('gid', 10)
      .select(['hepid','hep_alias','gid','profile'])
      .then(function(rows) {
      
       let dataReply = {
          total: rows.length,
          data: rows,
        };
        
        return dataReply;
      });
  }
  
  getFields(table, id, transaction) {
    return this.dataDb(table)
      .where({
          hepid: id,
          profile: transaction
      })
      .select(['id','gid','profile','fields_mapping'])
      .then(function(rows) {
      
       let dataReply = {
          total: rows[0] ? rows[0].length : 0,
          data: rows[0] ? rows[0] : [],
        };
        
        return dataReply;
      });
  }
}

export default MappingData;
