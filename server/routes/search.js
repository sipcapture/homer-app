import Joi from 'joi';
import Boom from 'boom';
import { forEach, isEmpty, size } from 'lodash';
import SearchData from '../classes/searchdata';
import RemoteData from '../classes/remotedata';
import Settings from '../classes/settings';

export default function search(server) {
  server.route({
    path: '/api/v3/search/call/data',
    method: 'POST',
    config: {
      validate: {
        payload: {
          param: {
            transaction: Joi.object(),
            limit: Joi.number().integer().min(0),
            location: Joi.object(),
            search: Joi.object(),
            timezone: Joi.object(),
          },
          timestamp: {
            from: Joi.date().timestamp().required(),
            to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: function(request, reply) {
      const searchdata = new SearchData(server, request.payload);
      const searchTable = 'hep_proto_1_default';
      searchdata.getSearchData(['id', 'sid', 'protocol_header', 'data_header'], searchTable, request.payload)
        .then(function(data) {
          if (!data) {
            return reply(Boom.notFound('data was not found'));
          }
          return reply(data);
        }).catch(function(error) {
          return reply(Boom.serverUnavailable(error));
        });
    },
  });
  
  server.route({
    path: '/api/v3/search/call/message',
    method: 'POST',
    config: {
      validate: {
        payload: {
          param: {
            transaction: Joi.object(),
            limit: Joi.number().integer().min(0),
            location: Joi.object(),
            search: Joi.object(),
            timezone: Joi.object(),
          },
          timestamp: {
            from: Joi.date().timestamp().required(),
            to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: function(request, reply) {
      const searchdata = new SearchData(server, request.payload);
      const searchTable = 'hep_proto_1_default';
      searchdata.getMessageById(['id', 'sid', 'protocol_header', 'data_header', 'raw'], searchTable, request.payload)
        .then(function(data) {
          if (!data) {
            return reply(Boom.notFound('data was not found'));
          }
          return reply(data);
        }).catch(function(error) {
          return reply(Boom.serverUnavailable(error));
        });
    },
  });
  
  server.route({
    path: '/api/v3/call/transaction',
    method: 'POST',
    config: {
      validate: {
        payload: {
          param: {
            id: Joi.object(),
            transaction: Joi.object(),
            limit: Joi.number().integer().min(0),
            location: Joi.object(),
            search: Joi.object(),
            timezone: Joi.object(),
          },
          timestamp: {
            from: Joi.date().timestamp().required(),
            to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: async function(request, reply) {
      let userObject = request.auth.credentials;
      const searchTable = 'hep_proto_1_default';
      
      const searchdata = new SearchData(server, request.payload.param);
      //const settings = new Settings(server, userObject.username);            
      const settings = new Settings(server, "null");            
            
      try {
      
        const correlation = await settings.getCorrelationMap(request.payload);
        const data = await searchdata.getTransaction(['id', 'sid', 'protocol_header', 'data_header', 'raw'],
          searchTable, request.payload, correlation, false);
                            
        /*
        const remotedata = new RemoteData(server, request.payload);
	const searchTable = 'hep_proto_1_default';
                        
        for (let corrs of correlation) { 
        
              console.log("REMO", corrs);            
              let stringCallidData = "";
              
              let sourceField = corrs['source_field'];
              let lookupId = corrs['lookup_id'];
              let lookupProfile = corrs['lookup_profile'];
              let lookupField = corrs['lookup_field'];
              let lookupRange = corrs['lookup_range'];
              let lookupDateRange = request.payload['timestamp'];
              let lookupCallid = request.payload.param['search'];

              let newDataWhere=[];
              let timeWhere = [];
              if(lookupId != 0) continue;

                                          
              //newDataWhere = newDataWhere.concat(dataWhere);
              //newDataWhere = newDataWhere.concat(dataSrcField[sourceField]);              

              let tFrom = new Date(lookupDateRange.from);
              let tTo = new Date(lookupDateRange.to);
        
              if (!isEmpty(lookupRange)) {
                  tFrom.setSeconds(tFrom.getSeconds() + lookupRange[0]);
                  tTo.setSeconds(tTo.getSeconds() + lookupRange[1]);
              }
              
              let searchPayload = {
                    param: {},
                    timestamp: {}              
              }

              searchPayload.param['server'] = lookupProfile;
              searchPayload.param['limit'] = 100;
              searchPayload.param['search'] = lookupField;                            
              searchPayload.timestamp['from'] = tFrom.getTime();
              searchPayload.timestamp['to'] = tTo.getTime();
              
              if(corrs.hasOwnProperty("callid_function")) 
              {                
                    var callIdFunction = eval("("+corrs.callid_function+")");
                    var callIdArray = callIdFunction(lookupCallid);
                    searchPayload.param['search'] = lookupField.replace("$source_field", callIdArray.join("|"));                    
              }              
                                        
              console.log("CORR Payload", searchPayload);
              console.log("CORR LOOP", corrs);

              console.log("REQ", request.payload);
              const rdata = await remotedata.getRemoteData(['id', 'sid', 'protocol_header', 'data_header'], searchTable, searchPayload);
              //console.log("RDATA", rdata);

              //const newDataRow = await this.getTransactionData(table, columns, lookupField, newDataWhere, timeWhere);
              //if (!isEmpty(newDataRow)) dataRow = dataRow.concat(newDataRow);                      
        }
        */
        
        if (!data) {
          return reply(Boom.notFound('data was not found'));
        }
        return reply(data);
      } catch (error) {
        return reply(Boom.serverUnavailable(error));
      };
    },
  });
  
  server.route({
    path: '/api/v3/call/report/qos',
    method: 'POST',
    config: {
      validate: {
        payload: {
          param: {
            id: Joi.object(),
            transaction: Joi.object(),
            limit: Joi.number().integer().min(0),
            location: Joi.object(),
            search: Joi.object(),
            timezone: Joi.object(),
          },
          timestamp: {
            from: Joi.date().timestamp().required(),
            to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: function(request, reply) {
      const searchdata = new SearchData(server, request.payload.param);
      const searchTable = 'hep_proto_1_default';
      searchdata.getTransactionQos(['id', 'sid', 'protocol_header', 'data_header', 'raw'], searchTable, request.payload)
        .then(function(data) {
          if (!data) {
            return reply(Boom.notFound('data was not found'));
          }
          return reply(data);
        }).catch(function(error) {
          return reply(Boom.serverUnavailable(error));
        });
    },
  });
  
  server.route({
    path: '/api/v3/call/report/log',
    method: 'POST',
    config: {
      validate: {
        payload: {
          param: {
            id: Joi.object(),
            transaction: Joi.object(),
            limit: Joi.number().integer().min(0),
            location: Joi.object(),
            search: Joi.object(),
            timezone: Joi.object(),
          },
          timestamp: {
            from: Joi.date().timestamp().required(),
            to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: function(request, reply) {
      const searchdata = new SearchData(server, request.payload.param);
      const searchTable = 'hep_proto_1_default';
      searchdata.getTransactionLog(['id', 'sid', 'protocol_header', 'data_header', 'raw'], searchTable, request.payload)
        .then(function(data) {
          if (!data) {
            return reply(Boom.notFound('data was not found'));
          }
          return reply(data);
        }).catch(function(error) {
          return reply(Boom.serverUnavailable(error));
        });
    },
  });
  
  server.route({
    path: '/api/v3/call/recording/data',
    method: 'POST',
    config: {
      validate: {
        payload: {
          param: {
            id: Joi.object(),
            transaction: Joi.object(),
            limit: Joi.number().integer().min(0),
            location: Joi.object(),
            search: Joi.object(),
            timezone: Joi.object(),
          },
          timestamp: {
            from: Joi.date().timestamp().required(),
            to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: function(request, reply) {
      const searchdata = new SearchData(server, request.payload.param);
      const searchTable = 'hep_proto_1_default';
      searchdata.getTransactionRecording(['id', 'sid', 'protocol_header', 'data_header', 'raw'], searchTable, request.payload)
        .then(function(data) {
          if (!data) {
            return reply(Boom.notFound('data was not found'));
          }
          return reply(data);
        }).catch(function(error) {
          return reply(Boom.serverUnavailable(error));
        });
    },
  });
};
