/**
 * A class to handle living beings in DB
 */
class LivingBeing {
  /**
   * Class constructor
   *
   * @param {object}
   *  {string} table
   *  {string} guid
   *  {object} db Knex connector
   */
  constructor({table, guid, db}) {
    this.table = table;
    this.guid = guid;
    this.db = db;
  }

  /**
   * Add new object
   *
   * @param {object} properties of object
   * @return {object} confirm
   */
  async add(properties) {
    try {
      return await this.db(this.table).insert(properties);
    } catch (err) {
      throw new Error(`fail to add a living being: ${err.message}`);
    }
  }

  /**
   * Update row by guid
   *
   * @param {object} properties of object
   * @return {object} confirm
   */
  async update(properties) {
    try {
      return await this.db(this.table)
        .where({
          guid: this.guid,
        })
        .update(properties);
    } catch (err) {
      throw new Error(`fail to update a living being: ${err.message}`);
    }
  }

  /**
   * Get all rows
   *
   * @param {array} columns of this.table
   * @return {array} add table data
   */
  async getAll(columns) {
    try {
      return await this.db(this.table).select(columns);
    } catch (err) {
      throw new Error(`fail to get all living beings: ${err.message}`);
    }
  }

  /**
   * Get row by guid
   *
   * @param {array} columns - list of column names
   * @return {array} table data
   */
  async get(columns) {
    try {
      return await this.db(this.table)
        .where({
          guid: this.guid,
        })
        .select(columns)
        .then(function([result]) {
          return result;
        });
    } catch (err) {
      throw new Error(`fail to get a living being: ${err.message}`);
    }
  }

  /**
   * Delete row by guid
   *
   * @return {object} confirm
   */
  async delete() {
    try {
    
      console.log("TABLE", this.table);
      console.log("GUID", this.guid);
      
      
      return await this.db(this.table)
        .where({
          guid: this.guid,
        })
        .delete();
    } catch (err) {
      throw new Error(`fail to delete a living being: ${err.message}`);
    }
  }
  
  /**
   * Delete row by guid
   *
   * @return {object} confirm
   */
  async delete(properties) {
    try {
      return await this.db(this.table)
        .where(properties)
        .delete();
    } catch (err) {
      throw new Error(`fail to delete a living being: ${err.message}`);
    }
  }
}

export default LivingBeing;
