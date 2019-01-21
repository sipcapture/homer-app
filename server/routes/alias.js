import uuid from 'uuid/v4';
import {pick} from 'lodash';
import Joi from 'joi';
import Boom from 'boom';
import Alias from '../classes/alias';


export default function alias(server) {
  server.route({
    /**
     * GET all alias
     *
     * @header
     *  @param {string} JWT token for authentication
     * @return {array} list of alias data
     */
    path: '/api/v3/alias',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: async function(request, reply) {
      const settings = new Alias({server});

      try {
        const data = await settings.getAll(['guid', 'ip', 'port', 'mask', 'captureID', 'alias', 'status']);
        if (!data || !data.length) {
          return reply(Boom.notFound('no alias found'));
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
     * GET alias by guid
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @return {array} list of alias data
     */
    path: '/api/v3/alias/{guid}',
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
      const settings = new Alias({server, guid});

      try {
        const data = await settings.get(['guid', 'ip', 'port', 'mask', 'captureID', 'alias', 'status']);
        if (!data || !Object.keys(data).length) {
          return reply(Boom.notFound('no alias found for guid ' + guid));
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
     * Create (POST) a new alias
     *
     * @header
     *  @param {string} JWT token for authentication
     * @payload
     *  @param {string} ip
     *  @param {number} port
     *  @param {number} mask
     *  @param {string} captureID
     *  @param {string} alias
     *  @param {boolean} status
     * @return alias guid and success message
     */
    path: '/api/v3/alias',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        payload: {
          ip: Joi.string().min(3).max(50).required(),
          port: Joi.number().required(),
          mask: Joi.number().required(),
          captureID: Joi.string().min(3).max(50).required(),
          alias: Joi.string().min(3).max(50).required(),
          status: Joi.string().required(),
        },
      },
    },
    handler: async function(request, reply) {
      const {ip, port, mask, captureID, alias, status} = request.payload;
      const guid = uuid();
      const settings = new Alias({server});

      try {
        await settings.add({guid, ip, port, mask, captureID, alias, status});
        return reply({
          data: guid,
          message: 'successfully created alias',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * Update (PUT) an alias
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @payload
     *  @param {string} ip
     *  @param {number} port
     *  @param {number} mask
     *  @param {string} captureID
     *  @param {string} alias
     *  @param {boolean} status
     * @return alias guid and success message
     */
    path: '/api/v3/alias/{guid}',
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
          ip: Joi.string().min(3).max(50),
          port: Joi.number(),
          mask: Joi.number(),
          captureID: Joi.string().min(3).max(50),
          alias: Joi.string().min(3).max(50),
          status: Joi.string(),
        },
      },
      pre: [
        {
          method: async function(request, reply) {
            const {guid} = request.params;
            const settings = new Alias({server, guid});

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== guid) {
                return reply(Boom.notFound(`the alias with id ${guid} was not found`));
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
      const updates = pick(request.payload, ['ip', 'port', 'mask', 'captureID', 'alias', 'status']);

      const settings = new Alias({server, guid});

      try {
        await settings.update(updates);
        return reply({
          data: guid,
          message: 'successfully updated alias',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * DELETE an alias
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @return alias guid and success message
     */
    path: '/api/v3/alias/{guid}',
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
            const settings = new Alias({server, guid});

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== guid) {
                return reply(Boom.notFound(`the alias with id ${guid} were not found`));
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
      const settings = new Alias({server, guid});

      try {
        await settings.delete();
        return reply({
          data: guid,
          message: 'successfully deleted alias',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });
};
