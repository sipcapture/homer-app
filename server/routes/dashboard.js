import uuid from 'uuid/v4';
import Boom from 'boom';
import Settings from '../classes/settings';

export default function dashboards(server) {

  server.route({
    /**
     * GET all dashboards
     *
     * @header
     *  @param {string} JWT token for authentication
     * @return {array} list of dashboards data
     */
    path: '/api/v3/dashboard/store/{dashboardId}',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: function(request, reply) {

      let userObject = request.auth.credentials;      
      const settings = new Settings(server, userObject.username);

      let table = 'user_settings';
      let dashboardId = encodeURIComponent(request.params.dashboardId);
        
      settings.getDashboard(table, ['id', 'username', 'gid', 'category', 'param', 'create_date', 'data'], dashboardId)
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
  
  server.route({
    /**
     * GET all dashboards
     *
     * @header
     *  @param {string} JWT token for authentication
     * @return {array} list of dashboards data
     */
    path: '/api/v3/dashboard/info',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: function(request, reply) {
    
      let userObject = request.auth.credentials;      
      const settings = new Settings(server, userObject.username);

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

    path: '/api/v3/dashboard/store/{dashboardId}',
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
      let newBoard = {
        guid: uuid(),
        username: userObject.username,
        param: dashboardId,
        gid: 10,
        category: 'dashboard',
        data: JSON.stringify(request.payload),
        create_date: new Date(),
      };
                
      settings.insertDashboard(table, dashboardId, newBoard)
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

    path: '/api/v3/dashboard/store/{dashboardId}',
    method: 'DELETE',
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
      settings.deleteDashboard(table, dashboardId)
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

    path: '/api/v3/dashboard/node',
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
};
