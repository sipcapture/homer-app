import Joi from 'joi';
import Boom from 'boom';
import RemoteData from '../classes/remotedata';
import Settings from '../classes/settings';

export default function search(server) {
  server.route({
    path: '/api/v3/search/remote/data',
    method: 'POST',
    config: {
      validate: {
        payload: {
          param: {
            limit: Joi.number().integer().min(0),
            search: Joi.string(),
            server: Joi.string(),
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
      const remotedata = new RemoteData(server, request.payload);
      const searchTable = 'hep_proto_1_default';
      remotedata.getRemoteData(['id', 'sid', 'protocol_header', 'data_header'], searchTable, request.payload)
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
    path: '/api/v3/search/remote/label',
    method: 'GET',
    handler: function(request, reply) {
      const remotedata = new RemoteData(server, request.payload);
      const searchTable = 'hep_proto_1_default';
      remotedata.getRemoteLabels(['id', 'sid', 'protocol_header', 'data_header'], searchTable, request.payload)
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
