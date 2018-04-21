import LivingBeing from './living_being';

const table = 'users';

/**
 * A class to handle users in DB
 */
class User extends LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} username
   */
  constructor({server, guid, username}) {
    super({db: server.databases.config, table, guid});
    this.configDb = server.databases.config;
    this.username = username;
    this.guid = guid;
  }

  /**
   * Get user data
   *
   * @param {array} columns of user table
   * @return {object} user data
   */
  async get(columns) {
    try {
      if (this.username) {
        return await this.configDb(table)
          .where({
            username: this.username,
          })
          .select(columns)
          .then(function([user]) {
            return user;
          });
      }

      if (!this.guid) {
        throw new Error('to get an user, you must provide users "guid" or "username"');
      }

      return await super.get(columns);
    } catch (err) {
      throw new Error(`fail to get user: ${err.message}`);
    }
  }

  /**
   * Get all users
   *
   * @param {array} columns of table
   * @return {array} users data
   */
  async getAll(columns) {
    try {
      return await super.getAll(columns);
    } catch (err) {
      throw new Error(`fail to get all users: ${err.message}`);
    }
  }

  /**
   * Add user
   *
   * @param {object} properties of user
   * @return {object} confirm
   */
  async add(properties) {
    try {
      return await super.add(properties);
    } catch (err) {
      throw new Error(`fail to add a new user: ${err.message}`);
    }
  }

  /**
   * Update user
   *
   * @param {object} properties of user
   * @return {object} confirm
   */
  async update(properties) {
    try {
      return await super.update(properties);
    } catch (err) {
      throw new Error(`fail to update user: ${err.message}`);
    }
  }

  /**
   * Delete user
   *
   * @return {object} confirm
   */
  async delete() {
    try {
      return await super.delete();
    } catch (err) {
      throw new Error(`fail to delete user: ${err.message}`);
    }
  }
}

export default User;
