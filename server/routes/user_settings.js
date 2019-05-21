import uuid from 'uuid/v4';
import {pick} from 'lodash';
import Joi from 'joi';
import Boom from 'boom';
import UserSettings from '../classes/user_settings';

export default function users(server) {
  server.route({
    /**
     * GET all users settings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @return {array} list of users data
     */
    path: '/api/v3/user/settings',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: async function(request, reply) {
      const settings = new UserSettings({server});

      try {
        const data = await settings.getAll(['guid', 'username', 'partid', 'category', 'param', 'data']);
        if (!data || !data.length) {
          return reply(Boom.notFound('no users settings found'));
        }
        
        data.sort(function(a, b){
              if(a.username < b.username) { return -1; }
              if(a.username > b.username) { return 1; }
              return 0;
        });                                                 
  
        return reply({
          count: data.length,
          data,
        });
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * GET user settings by guid
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @return {array} list of users data
     */
    path: '/api/v3/user/settings/{guid}',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        params: {
          guid: Joi.string().min(12).max(46).required(),
        },
      },
    },
    handler: async function(request, reply) {
      const {guid} = request.params;
      const settings = new UserSettings({server, guid});

      try {
        const data = await settings.get(['guid', 'username', 'partid', 'category', 'param', 'data']);
        if (!data || !Object.keys(data).length) {
          return reply(Boom.notFound('no users settings found for guid ' + guid));
        }
  
        return reply({
          count: data.length,
          data,
        });
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * Create (POST) a new user settings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @payload
     *  @param {string} username
     *  @param {number} partid
     *  @param {string} category
     *  @param {string} param
     *  @param {string} data
     * @return user settings guid and success message
     */
    path: '/api/v3/user/settings',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        payload: {
          username: Joi.string().min(3).max(50).required(),
          partid: Joi.number().required(),
          category: Joi.string().min(3).max(50).required(),
          param: Joi.string().min(3).max(50).required(),
          data: Joi.string(),
        },
      },
    },
    handler: async function(request, reply) {
      const {username, partid, category, param, data} = request.payload;
      const guid = uuid();
      const settings = new UserSettings({server});

      try {
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

  server.route({
    /**
     * Update (PUT) an user setttings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @payload
     *  @param {string} username
     *  @param {number} partid
     *  @param {string} category
     *  @param {string} param
     *  @param {string} data
     * @return user settings guid and success message
     */
    path: '/api/v3/user/settings/{guid}',
    method: 'PUT',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        params: {
          guid: Joi.string().min(12).max(46).required(),
        },
        payload: {
          username: Joi.string().min(3).max(50),
          partid: Joi.number(),
          category: Joi.string().min(3).max(50),
          param: Joi.string().min(3).max(50),
          data: Joi.string(),
        },
      },
      pre: [
        {
          method: async function(request, reply) {
            const {guid} = request.params;
            const settings = new UserSettings({server, guid});

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== guid) {
                return reply(Boom.notFound(`the user settings with id ${guid} was not found`));
              }

              return reply.continue();
            } catch (err) {
              return reply(Boom.serverUnavailable(err));
            }
          },
        },
      ],
    },
    handler: async function(request, reply) {
      const {guid} = request.params;
      const updates = pick(request.payload, ['username', 'partid', 'category', 'param', 'data']);

      const settings = new UserSettings({server, guid});

      try {
        await settings.update(updates);
        return reply({
          data: guid,
          message: 'successfully updated user settings',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * DELETE an user settings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @return user settings guid and success message
     */
    path: '/api/v3/user/settings/{guid}',
    method: 'DELETE',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        params: {
          guid: Joi.string().min(12).max(46).required(),
        },
      },
      pre: [
        {
          method: async function(request, reply) {
            const {guid} = request.params;
            const settings = new UserSettings({server, guid});

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== guid) {
                return reply(Boom.notFound(`the user settings with id ${guid} were not found`));
              }

              return reply.continue();
            } catch (err) {
              return reply(Boom.serverUnavailable(err));
            }
          },
        },
      ],
    },
    handler: async function(request, reply) {
      const {guid} = request.params;
      const settings = new UserSettings({server, guid});

      try {
        await settings.delete();
        return reply({
          data: guid,
          message: 'successfully deleted user settings',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });
};
