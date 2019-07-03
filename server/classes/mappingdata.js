import LivingBeing from './living_being';

const table = 'mapping_schema';

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

  constructor({server, guid}) {
    super({db: server.databases.config, table, guid});
    this.configDb = server.databases.config;
    this.table = "mapping_schema";
    this.guid = guid;
  }

  /*
  select * from hep where (hep_header->>'payloadType')::int = 1 limit 1;
  return knex('books').select(knex.raw("data->'author' as author"))
    .whereRaw("data->'author'->>'first_name'=? ",[books[0].author.first_name])
  */
  getProtocols() {
    return this.configDb(this.table)
      .where('partid', 10)
      .select(['hepid', 'hep_alias', 'partid', 'profile'])
      .then(function(rows) {
        let dataReply = {
          total: rows.length,
          data: rows,
        };
        
        return dataReply;
      });
  }
  
  getFields(id, transaction) {
    return this.configDb(this.table)
      .where({
        hepid: id,
        profile: transaction,
      })
      .select(['id', 'partid', 'profile', 'fields_mapping'])
      .then(function(rows) {
        let dataReply = {
          total: rows[0] ? rows[0].length : 0,
          data: rows[0] ? rows[0] : [],
        };
        
        return dataReply;
      });
  }
  
  /**
   * Get mapping data
   *
   * @param {array} columns of mapping table
   * @return {object} mapping data
   */
  async get(columns) {
    try {
      return await super.get(columns);
    } catch (err) {
      throw new Error(`get mapping: ${err.message}`);
    }
  }

  /**
   * Get all mapping
   *
   * @param {array} columns of table
   * @return {array} mapping data
   */
  async getAll(columns) {
    try {
      return await super.getAll(columns);
    } catch (err) {
      throw new Error(`get all mapping: ${err.message}`);
    }
  }

  /**
   * Add mapping
   *
   * @param {object} properties of mapping
   * @return {object} confirm
   */
  async add(properties) {
    try {
      return await super.add(properties);
    } catch (err) {
      throw new Error(`add new mapping: ${err.message}`);
    }
  }

  /**
   * Update mapping
   *
   * @param {object} properties of mapping
   * @return {object} confirm
   */
  async update(properties) {
    try {
      return await super.update(properties);
    } catch (err) {
      throw new Error(`update mapping: ${err.message}`);
    }
  }

  /**
   * Delete mapping
   *
   * @return {object} confirm
   */
  async delete() {
    try {
      
      return await this.db(this.table)
                   .where({ guid: this.guid,})
                   .delete();
                         
      //return await super.delete();
    } catch (err) {
      throw new Error(`delete mapping: ${err.message}`);
    }
  }
}

export default MappingData;
