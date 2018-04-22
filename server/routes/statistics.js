import uuid from 'uuid/v4';
import Boom from 'boom';
import Stats from '../classes/statistics';

export default function statistics(server) {

  server.route({

    path: '/api/v4/statistic/_db',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: function(request, reply) {
    
      console.log("SERVER", server.databases.statistics);
      let userObject = request.auth.credentials;      
      const stats = new Stats(server, userObject.username);

      let table = 'user_settings';
      let dashboardId = "a";
      //let dashboardId = encodeURIComponent(request.params.dashboardId);
        
      stats.getDatabases()
        .then(function(data) {
          if (!data) {
            return reply(Boom.notFound('dashboard was not found'));
          }
          return reply(data.data);
        }).catch(function(error) {
          return reply(Boom.serverUnavailable(error));
        });
    },
  });  
};
