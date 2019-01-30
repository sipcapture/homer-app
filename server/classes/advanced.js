import LivingBeing from './living_being';

const table = 'global_settings';

/**
 * A class to handle advanced in DB
 */
class Advanced extends LivingBeing {
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
   * Get advanced data
   *
   * @param {array} columns of advanced table
   * @return {object} advanced data
   */
  async get(columns) {
    try {
      return await super.get(columns);
    } catch (err) {
      throw new Error(`get advanced: ${err.message}`);
    }
  }

  /**
   * Get all advanced
   *
   * @param {array} columns of table
   * @return {array} advanced data
   */
  async getAll(columns) {
    try {
      return await super.getAll(columns);
    } catch (err) {
      throw new Error(`get all advanced: ${err.message}`);
    }
  }

  /**
   * Add advanced
   *
   * @param {object} properties of advanced
   * @return {object} confirm
   */
  async add(properties) {
    try {
      return await super.add(properties);
    } catch (err) {
      throw new Error(`add new advanced: ${err.message}`);
    }
  }

  /**
   * Update advanced
   *
   * @param {object} properties of advanced
   * @return {object} confirm
   */
  async update(properties) {
    try {
      return await super.update(properties);
    } catch (err) {
      throw new Error(`update advanced: ${err.message}`);
    }
  }

  /**
   * Delete advanced
   *
   * @return {object} confirm
   */
  async delete() {
    try {
      return await super.delete();
    } catch (err) {
      throw new Error(`delete advanced: ${err.message}`);
    }
  }
}

export default Advanced;
