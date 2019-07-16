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
          return reply(Boom.notFound('retentions have not been found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });
  
  server.route({

    path: '/api/v3/statistic/_measurements/{databaseId}',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: function(request, reply) {
      let databaseId = encodeURIComponent(request.params.databaseId);
      let userObject = request.auth.credentials;
      const stats = new Stats(server, userObject.username);

      stats.getMeasurements(databaseId).then(function(data) {
        if (!data) {
          return reply(Boom.notFound('measurements have not been found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });
  
  server.route({

    path: '/api/v3/statistic/_tags',
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
      let search = param.search;
      let userObject = request.auth.credentials;
      const stats = new Stats(server, userObject.username);
      
      stats.getTagsKeys(search).then(function(data) {
        if (!data) {
          return reply(Boom.notFound('tags keys have been not found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });
  
  server.route({

    path: '/api/v3/statistic/_fields',
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
      let search = param.search;
      let userObject = request.auth.credentials;
      const stats = new Stats(server, userObject.username);
      
      stats.getTagsValues(search).then(function(data) {
        if (!data) {
          return reply(Boom.notFound('tags values were not found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });
  
  server.route({

    path: '/api/v3/statistic/_metrics',
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
            query: Joi.array(),
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
      let query = param.query[0];
      let userObject = request.auth.credentials;
      const stats = new Stats(server, userObject.username);
      
      stats.getMetrics(query).then(function(data) {
        if (!data) {
          return reply(Boom.notFound('metrics have not been found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });
  
  server.route({

    path: '/api/v3/statistic/data',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        payload: {
          param: {
            bfrom: Joi.number().integer().min(0),
            limit: Joi.number().integer().min(0),
            precision: Joi.number().integer().min(0),
            filter: Joi.array(),
            query: Joi.array(),
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
      let payload = request.payload;
      let userObject = request.auth.credentials;
      const stats = new Stats(server, userObject.username);
      
      stats.getData(payload).then(function(data) {
        if (!data) {
          return reply(Boom.notFound('stats data has not been found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });
};
