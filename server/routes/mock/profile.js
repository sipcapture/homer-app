import admin_profiles from './data/admin_profiles';
import profile_store from './data/profile_store';
import profile_store_limits from './data/profile_store_limits';

export default [
  {
    /**
     * Set remote profiles
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/profile/store/search',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      // request.params.data = "{"id":"search","param":{}}";
      return reply(profile_store_limits.data);
    }
  },
  {
    /**
     * Set remote profiles
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/profile/store/result',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      // request.params.data = "{"id":"result","param":{"limit":200,"restype":{"name":"table","value":"TABLE"}}}";
      return reply(profile_store_limits.data);
    }
  },
  {
    /**
     * Set remote profiles
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/profile/store/node',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      // request.params.data = "{"id":"node","param":{"node":{"name":"localhost","id":"localhost"}}}";
      return reply(profile_store_limits.data);
    }
  },
  {
    /**
     * Set remote profiles
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/profile/store/limit',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      // request.params.data = "{"id":"limit","param":200}";
      return reply(profile_store_limits.data);
    }
  },
  {
    /**
     * Set remote profiles
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/profile/store/timerange',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      // request.params.data = "{"id":"timerange","param":{"from":"2018-01-08T16:16:46.032Z","to":"2018-01-09T16:16:46.032Z","custom":"Now() - 1440"}}";
      return reply(profile_store_limits.data);
    }
  },
  {
    /**
     * Get admin profiles
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/admin/profiles',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      return reply(admin_profiles.data);
    }
  },
  {
    /**
     * Get profile
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/profile/store',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      return reply(profile_store.data);
    }
  }
];
