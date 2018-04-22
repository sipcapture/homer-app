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
  
  getMeasurements(database) {
    return this.statsDb.getMeasurements(database).then((mses) => {
      let mesNames = [];
      mses.forEach((ms) => {
        mesNames.push({name: ms, value: ms});
      });

      let globalReply = {
        total: mesNames.length,
        data: mesNames,
        status: 'ok',
        auth: 'ok',
      };
        
      return globalReply;
    })
      .catch((err) => {
        console.error('Error....');
      });
  }
  
  getMetrics(query) {
    let main = query.main;
    let database = query.database;
    let retention = query.retention;
     
    let options = {
      database: database,
      precision: 's',
      retentionPolicy: retention,
    };
    
    let influxQuery = 'SHOW FIELD KEYS FROM "'+main+'"';
      
    return this.statsDb.queryRaw(influxQuery, options).then((mses) => {
      let mesNames = [];
      let values = mses.results[0].series[0].values;
      values.forEach((value) => {
        mesNames.push({name: value[0], value: value[0]});
      });

      let globalReply = {
        total: mesNames.length,
        data: mesNames,
        status: 'ok',
        auth: 'ok',
      };
        
      return globalReply;
    })
      .catch((err) => {
        console.error('Error....');
      });
  }
  
  getTags(query) {
    let main = query.main;
    let database = query.database;
    let retention = query.retention;
    
    let options = {
      database: database,
      precision: 's',
      retentionPolicy: retention,
    };
    
    let influxQuery = 'SHOW TAG KEYS FROM "'+main+'"';
    
    return this.statsDb.queryRaw(influxQuery, options).then((mses) => {
      let mesNames = [];
      let values = mses.results[0].series[0].values;
      
      values.forEach((value) => {
        mesNames.push({name: value[0], value: value[0]});
      });

      let globalReply = {
        total: mesNames.length,
        data: mesNames,
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
