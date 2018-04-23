import uuid from 'uuid/v4';
import Boom from 'boom';
import Settings from '../classes/settings';

export default function dashboards(server) {

  server.route({

    path: '/api/v3/admin/profiles',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: function(request, reply) {
      let userObject = request.auth.credentials;      
      const settings = new Settings(server, userObject.username);
      let dashboardId = encodeURIComponent(request.params.dashboardId);
        
      let table = 'user_settings';
      settings.getDashboardList(table, ['id', 'username', 'gid', 'category', 'param', 'create_date', 'data'])
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
      let dashboardId = encodeURIComponent(request.params.dashboardId);
        
      let table = 'user_settings';
      settings.getDashboardList(table, ['id', 'username', 'gid', 'category', 'param', 'create_date', 'data'])
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
    handler: function(request, reply) {
      let userObject = request.auth.credentials;      
      const settings = new Settings(server, userObject.username);
      let dashboardId = encodeURIComponent(request.params.dashboardId);
        
      let table = 'user_settings';
      settings.getDashboardList(table, ['id', 'username', 'gid', 'category', 'param', 'create_date', 'data'])
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
};
