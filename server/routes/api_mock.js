import Joi from 'joi';

import dashboards from './api_mock_data/dashboards';
import node from './api_mock_data/node';
import profiles from './api_mock_data/profiles';
import dashboardInfo from './api_mock_data/dashboard_info';

export default [
  {
    /**
     * GET dashboard info
     *
     * @header
     *  @param {string} JWT token - authentication
     * @request
     *  @param {string} boardID - dashboard id
     */
    path: '/api/v2/dashboard/store/{boardID}',
    method: 'GET',
    config: {
      //auth: {
      //  strategy: 'token'
      //},
      validate: {
        params: {
          boardID: Joi.string().min(3).max(46).required()
        }
      }
    },
    handler: function (request, reply) {
      return reply(dashboards[request.params.boardID]);
    }
  },
  {
    /**
     * GET dashboards info
     *
     * @request
     *  @param {string} boardID - dashboard id
     */
    path: '/api/v2/dashboard/info',
    method: 'GET',
    //config: { // to-do: authenticate later
    //  auth: {
    //    strategy: 'token'
    //  }
    //},
    handler: function (request, reply) {
      return reply(dashboardInfo);
    }
  },
  {
    /**
     * GET node info
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v2/dashboard/node',
    method: 'GET',
    config: {
      //auth: {
      //  strategy: 'token'
      //}
    },
    handler: function (request, reply) {
      return reply(node);
    }
  },
  {
    /**
     * GET profiles info
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v2/admin/profiles',
    method: 'GET',
    config: {
      //auth: {
      //  strategy: 'token'
      //}
    },
    handler: function (request, reply) {
      return reply(profiles);
    }
  }
];
