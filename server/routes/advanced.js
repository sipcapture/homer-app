import uuid from 'uuid/v4';
import {pick} from 'lodash';
import Joi from 'joi';
import Boom from 'boom';
import Advanced from '../classes/advanced';

export default function advanced(server) {
  server.route({
    /**
     * GET all advanced settings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @return {array} list of advanced data
     */
    path: '/api/v3/advanced',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: async function(request, reply) {
      const settings = new Advanced({server});

      try {
        const data = await settings.getAll(['guid', 'partid', 'category', 'param', 'data']);
        if (!data || !data.length) {
          return reply(Boom.notFound('no advanced settings found'));
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
     * GET advanced settings by guid
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @return {array} list of advanced data
     */
    path: '/api/v3/advanced/{guid}',
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
      const settings = new Advanced({server, guid});

      try {
        const data = await settings.get(['guid', 'partid', 'category', 'param', 'data']);
        if (!data || !Object.keys(data).length) {
          return reply(Boom.notFound('no advacned settings found for guid ' + guid));
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
     * Create (POST) a new advanced settings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @payload
     *  @param {number} partid
     *  @param {string} category
     *  @param {string} param
     *  @param {string} data
     * @return advanced settings guid and success message
     */
    path: '/api/v3/advanced',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        payload: {
          partid: Joi.number().required(),
          category: Joi.string().min(3).max(50).required(),
          param: Joi.string().min(3).max(50).required(),
          data: Joi.string(),
        },
      },
    },
    handler: async function(request, reply) {
      const {partid, category, param, data} = request.payload;
      const guid = uuid();
      const settings = new Advanced({server});

      try {
        await settings.add({guid, partid, category, param, data});
        return reply({
          data: guid,
          message: 'successfully created advanced settings',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * Update (PUT) an advanced setttings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @payload
     *  @param {number} partid
     *  @param {string} category
     *  @param {string} param
     *  @param {string} data
     * @return advanced settings guid and success message
     */
    path: '/api/v3/advacned/{guid}',
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
            const settings = new Advanced({server, guid});

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== guid) {
                return reply(Boom.notFound(`the advanced settings with id ${guid} was not found`));
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
      const updates = pick(request.payload, ['partid', 'category', 'param', 'data']);

      const settings = new Advanced({server, guid});

      try {
        await settings.update(updates);
        return reply({
          data: guid,
          message: 'successfully updated advanced settings',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * DELETE an advanced settings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @return advanced settings guid and success message
     */
    path: '/api/v3/advacned/{guid}',
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
            const settings = new Advanced({server, guid});

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== guid) {
                return reply(Boom.notFound(`the advanced settings with id ${guid} were not found`));
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
      const settings = new Advanced({server, guid});

      try {
        await settings.delete();
        return reply({
          data: guid,
          message: 'successfully deleted advanced settings',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });
};
