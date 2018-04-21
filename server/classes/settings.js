import LivingBeing from './living_being';

const table = 'user_settings';

/**
 * A class to handle users in DB
 */
class Settings extends LivingBeing {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} username
   */
  constructor(server, username) {
    super({db: server.databases.config, table});
    this.configDb = server.databases.config;
    this.username = username;
  }

  /**
   * Get user data by 'username'
   *
   * @param {array} columns - list of column names
   * @return {object} user data
   */
  get(columns) {
    return this.configDb(table)
      .where({
        username: this.username,
      })
      .select(columns)
      .then(function([user]) {
        return user;
      });
  }
  
  getDashboard(table, columns, dashboardId) {
    let dataWhere = {};

    dataWhere['username'] = this.username;
    dataWhere['category'] = 'dashboard';
    dataWhere['param'] = dashboardId;
    
    return this.configDb(table)
      .where(dataWhere)
      .select(columns)
      .then(function([dashboard]) {
        let globalReply = {
          total: 3,
          data: dashboard,
          status: 'ok',
          auth: 'ok',
        };
        return globalReply;
      });
  }
  
  getDashboardList(table, columns) {
    let dataWhere = {};

    dataWhere['username'] = this.username;
    dataWhere['category'] = 'dashboard';
    
    return this.configDb(table)
      .where(dataWhere)
      .select(columns)
      .then(function(rows) {
        let dashboardList = [];
           
        rows.forEach(function(row) {
          let dashboardElement = {
            cssclass: 'fa',
            href: '',
            id: '',
            name: 'undefined',
            param: '',
            shared: 0,
            type: 0,
            weight: 10,
          };
                
          if (row.hasOwnProperty('param')) {
            dashboardElement.href = row['param'];
            dashboardElement.id = row['param'];
          }
                
          if (row.hasOwnProperty('data')) {
            if (row['data'].hasOwnProperty('name')) dashboardElement.name = row['data']['name'];
            if (row['data'].hasOwnProperty('weight')) dashboardElement.weight = row['data']['weight'];
          }
                
          dashboardList.push(dashboardElement);
        });
          
        let globalReply = {
          total: dashboardList.length,
          data: dashboardList,
          status: 'ok',
          auth: 'ok',
        };
        return globalReply;
      });
  }
  
  insertDashboard(table, dashboardId, newBoard) {
    let dataWhere = {};

    dataWhere['username'] = this.username;
    dataWhere['category'] = 'dashboard';
    dataWhere['param'] = dashboardId;

    let that = this;
        
    return this.configDb(table)
      .where(dataWhere)
      .del()
      .then(function(rows) {
        return that.configDb(table).insert(newBoard).into(table)
          .then(function(resp) {
            let id = resp[0];
            let globalReply = {
              total: 3,
              status: 'ok',
              auth: 'ok',
            };
                    
            if (id == 0) globalReply = 'bad';
                    
            return globalReply;
          });
      });
  }
  
  deleteDashboard(table, dashboardId) {
    let dataWhere = {};

    dataWhere['username'] = this.username;
    dataWhere['category'] = 'dashboard';
    dataWhere['param'] = dashboardId;
        
    return this.configDb(table)
      .where(dataWhere)
      .del()
      .then(function(rows) {
        let globalReply = {
          total: 3,
          status: 'ok',
          auth: 'ok',
        };
        return globalReply;
      });
  }
}

export default Settings;
