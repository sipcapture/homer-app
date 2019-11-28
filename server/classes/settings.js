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
        let dashboardHome = '{"id":"home","name":"Home","alias":"home","selectedItem":"","title":"Home","weight":10.0,"widgets":[{"reload":false,"frameless":false,"title":"World Clock","group":"Tools","name":"clock","description":"Display date and time","templateUrl":"widgets/clock/view.html","controller":"clockController","controllerAs":"clock","sizeX":1,"sizeY":1,"config":{"title":"World Clock","timePattern":"HH:mm:ss","datePattern":"YYYY-MM-DD","location":{"value":-60,"offset":"+1","name":"GMT+1 CET","desc":"Central European Time"},"showseconds":false},"edit":{"reload":true,"immediate":false,"controller":"clockEditController","templateUrl":"widgets/clock/edit.html"},"row":0,"col":0,"api":{},"uuid":"0131d42a-793d-47d6-ad03-7cdc6811fb56"},{"title":"Proto Search","group":"Search","name":"protosearch","description":"Display Search Form component","refresh":false,"sizeX":2,"sizeY":1,"config":{"title":"CALL SIP SEARCH","searchbutton":true,"protocol_id":{"name":"SIP","value":1},"protocol_profile":{"name":"call","value":"call"}},"uuid":"ed426bd0-ff21-40f7-8852-58700abc3762","fields":[{"name":"1:call:sid","selection":"Session ID","form_type":"input","hepid":1,"profile":"call","type":"string","field_name":"sid"},{"name":"1:call:protocol_header.srcIp","selection":"Source IP","form_type":"input","hepid":1,"profile":"call","type":"string","field_name":"protocol_header.srcIp"},{"name":"1:call:protocol_header.srcPort","selection":"Src Port","form_type":"input","hepid":1,"profile":"call","type":"integer","field_name":"protocol_header.srcPort"},{"name":"1:call:raw","selection":"SIP RAW","form_type":"input","hepid":1,"profile":"call","type":"string","field_name":"raw"}],"row":0,"col":1},{"title":"InfluxDB Chart","group":"Charts","name":"influxdbchart","description":"Display SIP Metrics","refresh":true,"sizeX":2,"sizeY":1,"config":{"title":"HEPIC Chart","chart":{"type":{"value":"line"}},"dataquery":{"data":[{"sum":false,"main":{"name":"heplify_method_response","value":"heplify_method_response"},"database":{"name":"homer"},"retention":{"name":"60s"},"type":[{"name":"counter","value":"counter"}],"tag":{},"typetag":{"name":"response","value":"response"}}]},"panel":{"queries":[{"name":"A1","type":{"name":"InfluxDB","alias":"influxdb"},"database":{"name":"homer"},"retention":{"name":"60s"},"value":"query"}]}},"edit":{},"api":{},"uuid":"8c8b4589-426a-4016-b964-d613ab6997b3","row":0,"col":3}],"config":{"margins":[10.0,10.0],"columns":"6","pushing":true,"draggable":{"handle":".box-header"},"resizable":{"enabled":true,"handles":["n","e","s","w","ne","se","sw","nw"]}}}';

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
