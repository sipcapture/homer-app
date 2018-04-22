import Boom from 'boom';
import Joi from 'joi';
import Stats from '../classes/statistics';

export default function statistics(server) {
  server.route({

    path: '/api/v3/statistic/_db',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: function(request, reply) {
      let userObject = request.auth.credentials;
      const stats = new Stats(server, userObject.username);

      stats.getDatabases().then(function(data) {
        if (!data) {
          return reply(Boom.notFound('db was not found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });
  
  server.route({

    path: '/api/v3/statistic/_retentions',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        payload: {
          param: {
            limit: Joi.number().integer().min(0),
            search: Joi.object(),
            total: Joi.bool(),
          },
          timestamp: {
            from: Joi.date().timestamp().required(),
            to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: function(request, reply) {
      let param = request.payload.param;
      let database = param.search.database;
      let userObject = request.auth.credentials;
      const stats = new Stats(server, userObject.username);

      stats.getRetentions(database).then(function(data) {
        if (!data) {
          return reply(Boom.notFound('db was not found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });
};
