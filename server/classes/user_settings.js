import LivingBeing from './living_being';

const table = 'user_settings';

/**
 * A class to handle user settings in DB
 */
class UserSettings extends LivingBeing {
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
   * Get user settings data
   *
   * @param {array} columns of user_settings table
   * @return {object} user settings data
   */
  async get(columns) {
    try {
      return await super.get(columns);
    } catch (err) {
      throw new Error(`get user settings: ${err.message}`);
    }
  }

  /**
   * Get all users settings
   *
   * @param {array} columns of table
   * @return {array} users data
   */
  async getAll(columns) {
    try {
      return await super.getAll(columns);
    } catch (err) {
      throw new Error(`get all users settings: ${err.message}`);
    }
  }

  /**
   * Add user settings
   *
   * @param {object} properties of user settings
   * @return {object} confirm
   */
  async add(properties) {
    try {
      return await super.add(properties);
    } catch (err) {
      throw new Error(`add new user settings: ${err.message}`);
    }
  }

  /**
   * Update user settings
   *
   * @param {object} properties of user settings
   * @return {object} confirm
   */
  async update(properties) {
    try {
      return await super.update(properties);
    } catch (err) {
      throw new Error(`update user settings: ${err.message}`);
    }
  }

  /**
   * Delete user settings
   *
   * @return {object} confirm
   */
  async delete() {
    try {
      return await super.delete();
    } catch (err) {
      throw new Error(`delete user settings: ${err.message}`);
    }
  }
  
  async delete(properties) {
    try {
      return await super.delete(properties);
    } catch (err) {
      throw new Error(`delete user settings: ${err.message}`);
    }
  }
}

export default UserSettings;
