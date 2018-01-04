import Joi from 'joi';
import Boom from 'boom';
import {assign} from 'lodash';

import dashboards from './api_mock_data/dashboards';
import dashboards_node from './api_mock_data/dashboards_node';
import dashboards_profiles from './api_mock_data/dashboards_profiles';
import dashboards_info from './api_mock_data/dashboards_info';

export default [
  {
    /**
     * POST store dashboard menu
     *
     * @header
     *  @param {string} JWT token - authentication
     * @request
     *  @param {string} boardID - dashboard id
     */
    path: '/api/v3/dashboard/menu/{boardID}',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
      validate: {
        params: {
          boardID: Joi.string().min(3).max(46).required()
        }
      }
    },
    handler: function (request, reply) {
      const boardID = request.params.boardID;
      const dashboard = request.payload;

      dashboards_info.data.push(dashboard);
      return reply(`dashboard "${boardID}" menu stored`);
    }
  },
  {
    /**
     * DELETE dashboard
     *
     * @header
     *  @param {string} JWT token - authentication
     * @request
     *  @param {string} boardID - dashboard id
     */
    path: '/api/v3/dashboard/store/{boardID}',
    method: 'DELETE',
    config: {
      auth: {
        strategy: 'token'
      },
      validate: {
        params: {
          boardID: Joi.string().min(3).max(46).required()
        }
      }
    },
    handler: function (request, reply) {
      const boardID = request.params.boardID;
      dashboards.data = dashboards.data.filter(d => d.id !== boardID);
      dashboards_info.data = dashboards_info.data.filter(d => d.id !== boardID);
      return reply(`dashboard "${boardID}" deleted`);
    }
  },
  {
    /**
     * POST store dashboard
     *
     * @header
     *  @param {string} JWT token - authentication
     * @request
     *  @param {string} boardID - dashboard id
     */
    path: '/api/v3/dashboard/store/{boardID}',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
      validate: {
        params: {
          boardID: Joi.string().min(3).max(46).required()
        }
      }
    },
    handler: function (request, reply) {
      const boardID = request.params.boardID;
      const dashboard = request.payload;

      dashboards.data = dashboards.data.filter(d => d.id !== boardID);
      dashboards.data.push(dashboard);
      return reply(`dashboard "${boardID}" stored`);
    }
  },
  {
    /**
     * PUT update dashboard
     *
     * @header
     *  @param {string} JWT token - authentication
     * @request
     *  @param {string} boardID - dashboard id
     */
    path: '/api/v3/dashboard/store/{boardID}',
    method: 'PUT',
    config: {
      auth: {
        strategy: 'token'
      },
      validate: {
        params: {
          boardID: Joi.string().min(3).max(46).required()
        }
      }
    },
    handler: function (request, reply) {
      const boardID = request.params.boardID;
      const dashboard = request.payload;

      const foundDash = dashboards.data.find(d => d.id === boardID);
      assign(foundDash, dashboard.param);
      const foundMenu = dashboards_info.data.find(d => d.id === boardID);
      assign(foundMenu, dashboard.param);

      dashboards.data = dashboards.data.filter(d => d.id !== boardID);
      dashboards.data.push(foundDash);
      dashboards_info.data = dashboards_info.data.filter(d => d.id !== boardID);
      dashboards_info.data.push(foundMenu);

      return reply(`dashboard "${boardID}" stored`);
    }
  },
  {
    /**
     * GET dashboard
     *
     * @header
     *  @param {string} JWT token - authentication
     * @request
     *  @param {string} boardID - dashboard id
     */
    path: '/api/v3/dashboard/store/{boardID}',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token'
      },
      validate: {
        params: {
          boardID: Joi.string().min(3).max(46).required()
        }
      }
    },
    handler: function (request, reply) {
      const boardID = request.params.boardID;
      const dashboard = dashboards.data.filter(d => d.id === boardID)[0];
            
      if (!dashboard) {
        return reply(Boom.notFound(`dashboard "${boardID}" not found`));
      }
      return reply(dashboard);
    }
  },
  {
    /**
     * GET dashboards info
     */
    path: '/api/v3/dashboard/info',
    method: 'GET',
    config: { // to-do: authenticate later
      auth: {
        strategy: 'token'
      }
    },
    handler: function (request, reply) {
      return reply(dashboards_info.data);
    }
  },
  {
    /**
     * GET node info
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/dashboard/node',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token'
      }
    },
    handler: function (request, reply) {
      return reply(dashboards_node.data);
    }
  },
  {
    /**
     * GET profiles info
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/admin/profiles',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token'
      }
    },
    handler: function (request, reply) {
      return reply(dashboards_profiles.data);
    }
  }
];
