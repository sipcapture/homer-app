import uuid from 'uuid/v4';
import Boom from 'boom';
import Settings from '../classes/settings';

export default function dashboards(server) {
  server.route({

    path: '/api/v3/admin/profiles',
    method: 'GET',
    config: {
      cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
      },
      auth: {
        strategy: 'token',
      },
    },
    handler: function(request, reply) {
      let userObject = request.auth.credentials;
      const settings = new Settings(server, userObject.username);
      // let dashboardId = encodeURIComponent(request.params.dashboardId);
        
      let table = 'user_settings';
      settings.getDashboardList(table, ['id', 'username', 'partid', 'category', 'param', 'create_date', 'data'])
        .then(function(data) {
          if (!data) {
            return reply(Boom.notFound('dashboard was not found'));
          }
          return reply(data);
        }).catch(function(error) {
          return reply(Boom.serverUnavailable(error));
        });
    },
  });
  
  server.route({

    path: '/api/v3/profile/store',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: function(request, reply) {
      let userObject = request.auth.credentials;
      const settings = new Settings(server, userObject.username);
      // let dashboardId = encodeURIComponent(request.params.dashboardId);
        
      let table = 'user_settings';
      settings.getProfileList(table, ['id', 'username', 'partid', 'category', 'param', 'create_date', 'data'])
        .then(function(data) {
          if (!data) {
            return reply(Boom.notFound('dashboard was not found'));
          }
          return reply(data);
        }).catch(function(error) {
          return reply(Boom.serverUnavailable(error));
        });
    },
  });
  
  server.route({

    path: '/api/v3/profile/store/{id}',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: async function(request, reply) {
      let userObject = request.auth.credentials;
      const settings = new Settings(server, userObject.username);
      let data = request.payload;
      let username = userObject.username;            
      let category = "profile";
      let partid = 10;
      const {id} = request.params;
      let param = id;
      
      // let dashboardId = encodeURIComponent(request.params.dashboardId);
      const guid = uuid();
                    
      let table = 'user_settings';
      	try {
                await settings.delete({username, partid, category, param});
		await settings.add({guid, username, partid, category, param, data});
                return reply({
                      data: guid,
                      message: 'successfully created user settings',
          	}).code(201);
	} catch (err) {  
        	return reply(Boom.serverUnavailable(err));
	}      
    },
  });
};
