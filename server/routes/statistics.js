import uuid from 'uuid/v4';
import Boom from 'boom';
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
};
