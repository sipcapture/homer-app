import LivingBeing from './living_being';

const table = 'alias';

/**
 * A class to handle alias in DB
 */
class Alias extends LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} guid
   */
  constructor({server, guid}) {
    super({db: server.databases.config, table, guid});
    this.configDb = server.databases.config;
    this.guid = guid;
  }

  /**
   * Get alias data
   *
   * @param {array} columns of alias table
   * @return {object} alias data
   */
  async get(columns) {
    try {
      return await super.get(columns);
    } catch (err) {
      throw new Error(`get alias: ${err.message}`);
    }
  }

  /**
   * Get all alias
   *
   * @param {array} columns of table
   * @return {array} alias data
   */
  async getAll(columns) {
    try {
      return await super.getAll(columns);
    } catch (err) {
      throw new Error(`get all alias: ${err.message}`);
    }
  }

  /**
   * Add alias
   *
   * @param {object} properties of alias
   * @return {object} confirm
   */
  async add(properties) {
    try {
      return await super.add(properties);
    } catch (err) {
      throw new Error(`add new alias: ${err.message}`);
    }
  }

  /**
   * Update alias
   *
   * @param {object} properties of alias
   * @return {object} confirm
   */
  async update(properties) {
    try {
      return await super.update(properties);
    } catch (err) {
      throw new Error(`update alias: ${err.message}`);
    }
  }

  /**
   * Delete alias
   *
   * @return {object} confirm
   */
  async delete() {
    try {
      return await super.delete();
    } catch (err) {
      throw new Error(`delete alias: ${err.message}`);
    }
  }
}

export default Alias;
