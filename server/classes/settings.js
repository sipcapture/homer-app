import LivingBeing from './living_being';
import uuid from 'uuid/v4';

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

        /* sort it by name */
        dashboardList = dashboardList.sort(function(a,b){ 
              // Use toUpperCase() to ignore character casing
              const AN = a.name.toUpperCase();
              const BN = b.name.toUpperCase();
              let comparison = 0;
              if (AN > BN) { comparison = 1; } 
              else if (AN < BN) { comparison = -1; }
              return comparison;
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
  
  getProfileList(table, columns) {
    let dataWhere = {};

    dataWhere['username'] = this.username;
    
    return this.configDb(table)
      .where(dataWhere)
      .select(columns)
      .then(function(rows) {

        let globalReply = {
          data: rows,
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
  
  async insertNewUserDashboard(table) {
        let dataWhere = {};
  	let dashboardHome ='{"id":"home","name":"Home","alias":"home","selectedItem":"","title":"Home","weight":10,"widgets":[{"x":0,"y":0,"cols":2,"rows":1,"name":"clock","title":"clock","id":"clock214","output":{},"config":{"id":"clock214","datePattern":"YYYY-MM-DD","location":{"value":-60,"offset":"+1","name":"GMT+1 CET","desc":"Central European Time"},"showseconds":false,"timePattern":"HH:mm:ss","title":"Home Clock"}},{"x":0,"y":1,"cols":2,"rows":3,"name":"display-results","title":"display-results","id":"display-results370","output":{},"config":{"id":"display-results370","title":"CALL SIP SEARCH","group":"Search","name":"protosearch","description":"Display Search Form component","refresh":false,"sizeX":2,"sizeY":2,"config":{"title":"CALL SIP SEARCH","searchbutton":true,"protocol_id":{"name":"SIP","value":1},"protocol_profile":{"name":"call","value":"call"}},"uuid":"ed426bd0-ff21-40f7-8852-58700abc3762","fields":[{"field_name":"data_header.from_user","hepid":1,"name":"1:call:data_header.from_user","selection":"SIP From user","type":"string"},{"field_name":"data_header.to_user","hepid":1,"name":"1:call:data_header.to_user","selection":"SIP To user","type":"string"},{"field_name":"data_header.method","hepid":1,"name":"1:call:data_header.method","selection":"SIP Method","type":"string"},{"field_name":"data_header.callid","hepid":1,"name":"1:call:data_header.callid","selection":"SIP Callid","type":"string"},{"field_name":"limit","hepid":1,"name":"1:call:limit","selection":"Query Limit","type":"string"},{"field_name":"targetResultsContainer","hepid":1,"name":"1:call:targetResultsContainer","selection":"Results Container","type":"string"}],"row":0,"col":1,"cols":2,"rows":2,"x":0,"y":1,"protocol_id":{"name":"SIP","value":100}}},{"x":2,"y":0,"cols":4,"rows":4,"name":"result","title":"result","id":"result560","output":{}}],"config":{"margins":[10,10],"columns":"6","pushing":true,"draggable":{"handle":".box-header"},"resizable":{"enabled":true,"handles":["n","e","s","w","ne","se","sw","nw"]}}}';

        dataWhere['username'] = this.username;
        dataWhere['category'] = 'dashboard';
        dataWhere['param'] = 'home';

        let count = await this.configDb(table).where(dataWhere).count("*").then(function(rows) { return rows[0]['count'];});                
        if(count == 0) {
            let newBoard = {
              guid: uuid(),
              username: this.username,
              param: "home",
              partid: 10,
              category: 'dashboard',
              data: dashboardHome,
              create_date: new Date(),
            };    
            let result =  await this.configDb(table).insert(newBoard).into(table).then(function(resp) {  return true; });
        }
        
        return true;
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
        
  async getCorrelationMap(data) {
    try {
      let sData = data.param.search;
      let dataWhere = {};
      let columns = ['correlation_mapping'];
      let profileKey = '';
      let table = 'mapping_schema';
      let resultMap = {};
    
      /* jshint -W089 */
  
      for (let key in sData) {
        profileKey = key;
      };

      let dataParse = profileKey.split('_', 2);
      dataWhere = {
        hepid: dataParse[0],
        profile: dataParse[1],
      };
      
      /*
    this.configDb.on( 'query', function( queryData ) {
        console.log( queryData );
    });
    */
      
      return await this.configDb(table)
        .where(dataWhere)
        .select(columns)
        .then(function(rows) {
          rows.forEach(function(row) {
            let dataElement = {};
            resultMap = row['correlation_mapping'];
          });
          
          return resultMap;
        });
    } catch (err) {
      throw new Error('fail to get data map:'+err);
    }
  }
  
  async getHepSubMap(data) {
    try {
      let sData = data.param.search;
      let dataWhere = {};
      let columns = ['mapping'];
      let profileKey = '';
      let table = 'hepsub_mapping_schema';
      let resultMap = {};
    
      /* jshint -W089 */
  
      for (let key in sData) {
        profileKey = key;
      };

      let dataParse = profileKey.split('_', 2);
      dataWhere = {
        hepid: dataParse[0],
        profile: dataParse[1],
      };
      
      /*
    this.configDb.on( 'query', function( queryData ) {
        console.log( queryData );
    });
    */
      
      return await this.configDb(table)
        .where(dataWhere)
        .select(columns)
        .then(function(rows) {
          rows.forEach(function(row) {
            let dataElement = {};
            resultMap = row['mapping'];
          });
          
          return resultMap;
        });
    } catch (err) {
      throw new Error('fail to get data map:'+err);
    }
  }
  
  async getHepSubAgents(hepSubMap, dataPayload) {
    try {
      let dataWhere = {};
      let columns = ['guid','host','port','protocol','path','node','type'];
      let profileKey = '';
      let table = 'agent_location_session';
      let resultMap = [];
      let allDataAgents = [];

      let parseQuery = function(input, callId, fromts, tots, lookupRange) {

          let newFromTs = fromts + lookupRange[0]*1000;
          let newToTs = tots + lookupRange[1]*1000;
          
          input = input.replace('$source_field', JSON.stringify(callId))
                  .replace('$fromts', newFromTs)
                  .replace('$tots', newToTs);                    
          return input;
        };

       let fromts = (new Date(dataPayload.timestamp.from)).getTime();
       let tots = (new Date(dataPayload.timestamp.to)).getTime();
       let callId = dataPayload.param.search['1_call']['callid']

      /* jshint -W089 */
  
      for (let key in hepSubMap) {
        
        let dataWhereIn = [];
        let lookupProfile = hepSubMap[key]['lookup_profile'];              
        let lookupQuery = hepSubMap[key]['lookup_field'];              
        let lookupRange = hepSubMap[key]['lookup_range'];                              

        let query = parseQuery(lookupQuery, callId, fromts, tots, lookupRange);        
        dataWhereIn.push(lookupProfile);
        const dataAgent =  await this.configDb(table)
          .select(columns)
          .whereIn('type', dataWhereIn)
          .whereRaw('NOW() between create_date AND expire_date')
          .then(function(rows) {
              rows.forEach(function(row) {
                row['query'] = query;
                resultMap.push(row);                
           });
          return resultMap;
        });
        
        allDataAgents = allDataAgents.concat(dataAgent);
      };
      
      return allDataAgents;

    } catch (err) {
      throw new Error('fail to get data map:'+err);
    }
  }
    
}

export default Settings;
