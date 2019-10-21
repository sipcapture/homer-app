import Joi from 'joi';
import Boom from 'boom';
import {forEach, isEmpty, size} from 'lodash';
import SearchData from '../classes/searchdata';
import RemoteData from '../classes/remotedata';
import Settings from '../classes/settings';
import Alias from '../classes/alias';

export default function search(server) {
  server.route({
    path: '/api/v3/search/call/data',
    method: 'POST',
    config: {
      cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
      },
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
    handler: async function(request, reply) {
      const aliasDB = new Alias({server});            
      const aliasRowData = await aliasDB.getAll(['guid', 'alias', 'ip', 'port', 'mask', 'captureID', 'status']);
      const aliasData = {};          
      aliasRowData.forEach(function(row) {
            aliasData[row.ip+":"+row.port] = row.alias;
      });
              
      console.log("AAL", aliasData);
          
      const searchdata = new SearchData(server, request.payload);
      const searchTable = 'hep_proto_1_default';
      searchdata.getSearchData(['id', 'sid', 'protocol_header', 'data_header'], searchTable, request.payload, aliasData)
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
      // let userObject = request.auth.credentials;

      const aliasDB = new Alias({server});            
      const aliasRowData = await aliasDB.getAll(['guid', 'alias', 'ip', 'port', 'mask', 'captureID', 'status']);
      const aliasData = {};          
      aliasRowData.forEach(function(row) {
            aliasData[row.ip+":"+row.port] = row.alias;
      });
              
      console.log("AAL", aliasData);
      
      const searchTable = 'hep_proto_1_default';
      
      const searchdata = new SearchData(server, request.payload.param);
      // const settings = new Settings(server, userObject.username);
      const settings = new Settings(server, 'null');
            
      try {
        const correlation = await settings.getCorrelationMap(request.payload);
        const data = await searchdata.getTransaction(['id', 'sid', 'protocol_header', 'data_header', 'raw'],
          searchTable, request.payload, correlation, false, aliasData);
     
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
      const searchTable = 'hep_proto_5_default';
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
    path: '/api/v3/call/report/hepsub',
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

      const searchTable = 'hep_proto_1_default';
      const searchdata = new SearchData(server, request.payload.param);
      const settings = new Settings(server, 'null');
            
      try {
        const hepSubMap = await settings.getHepSubMap(request.payload);       
        const remoteAgents = await settings.getHepSubAgents(hepSubMap, request.payload);
        const data = await searchdata.getHepSubData(remoteAgents);
     
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
