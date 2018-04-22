import LivingBeing from './living_being';

const table = 'user_settings';

/**
 * A class to handle users in DB
 */
class Statistics extends LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} username
   */
  constructor(server, username) {
    super({db: server.databases.statistics, table});
    this.statsDb = server.databases.statistics;
    this.username = username;
  }

  /**
   * Get user data by 'username'
   *
   * @param {array} columns - list of column names
   * @return {object} user data
   */
  getDatabases() {
    console.log("DB OOUT");
  
    return this.statsDb(table)
      .where({
        username: this.username,
      })
      .select(columns)
      .then(function([user]) {
        return user;
      });
  }  
}

export default Statistics;
