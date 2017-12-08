import Knex from '../config/db/knex';
import LivingBeing from './living_being';

const table = 'users';

/**
 * A class to handle users in DB
 */
class User extends LivingBeing {

  /**
   * Class constructor
   *
   * @param {object} username - name of user
   */
  constructor(username) {
    super({ table });
    this.username = username;
  }

  /**
   * Get user data by 'username'
   *
   * @param {array} columns - list of column names
   */
  get(columns) {
    return Knex(table)
      .where({
        username: this.username
      })
      .select(columns)
      .then(function ([user]) {
        return user;
      });
  }

}

export default User;
