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
    return this.statsDb.getDatabaseNames().then((names) => {
      let dbNames = [];
      
      names.forEach((name) => {
        dbNames.push({name: name, value: name});
      });
      
      let globalReply = {
        total: dbNames.length,
        data: dbNames,
        status: 'ok',
        auth: 'ok',
      };
        
      return globalReply;
    })
      .catch((err) => {
        console.error('Error....');
      });
  }
  
  getRetentions(database) {
    return this.statsDb.showRetentionPolicies(database).then((polices) => {
      let retNames = [];
      polices.forEach((police) => {
        retNames.push({name: police.name, value: police.name});
      });

      let globalReply = {
        total: retNames.length,
        data: retNames,
        status: 'ok',
        auth: 'ok',
      };
        
      return globalReply;
    })
      .catch((err) => {
        console.error('Error....');
      });
  }
}

export default Statistics;
