import uuid from 'uuid/v4';
import {pick} from 'lodash';
import Joi from 'joi';
import Boom from 'boom';
import AgentSubscribe from '../classes/agent_subscribe';


export default function agent_subscribe(server) {
  server.route({
    /**
     * GET all agent_subscribe
     *
     * @header
     * @param {string} JWT token for authentication
     * @return {array} list of agent_subscribe data
     */
    path: '/api/v3/agent/subscribe',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: async function(request, reply) {
      const settings = new AgentSubscribe({server});

      try {
        const data = await settings.getAll(['guid', 'host', 'port', 'protocol', 'path', 'node', 'type','create_date','expire_date','active']);
        if (!data || !data.length) {
          return reply(Boom.notFound('no agent_subscribe found'));
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
     * GET agent_subscribe by guid
     *
     * @header
     * @param {string} JWT token for authentication
     * @request
     * @param {string} guid
     * @return {array} list of agent_subscribe data
     */
    path: '/api/v3/agent/subscribe/{guid}',
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
      const settings = new AgentSubscribe({server, guid});

      try {
        const data = await settings.get(['guid', 'host', 'port', 'protocol', 'path', 'node', 'type','create_date','expire_date','active']);
        if (!data || !Object.keys(data).length) {
          return reply(Boom.notFound('no agent_subscribe found for guid ' + guid));
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
     * Create (POST) a new agent_subscribe
     *
     * @header
     * @param {string} JWT token for authentication
     * @payload
     * @param {string} agent_subscribe
     * @param {string} ip
     * @param {number} port
     * @param {number} mask
     * @param {string} captureID
     * @param {boolean} status
     * @return agent_subscribe guid and success message
     */
    path: '/api/v3/agent/subscribe',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        payload: {
           host: Joi.string().min(1).max(250),
           port: Joi.number(),
           protocol: Joi.string().min(1).max(50),
           path: Joi.string().min(1).max(250),
           node: Joi.string().min(1).max(100),
           type: Joi.string().min(1).max(200),
           create_date: Joi.date(),
           expire_date: Joi.date(),
           active: Joi.boolean(),
        },
      },
    },
    handler: async function(request, reply) {
      const {host, port, protocol, path, node, type, create_date, expire_date, status} = request.payload;
      const guid = uuid();
      const gid = 10;
      const settings = new AgentSubscribe({server});

      try {
        await settings.add({guid, gid, host, port, protocol, path, node, type, create_date, expire_date, status});
        return reply({
          data: guid,
          message: 'successfully created agent_subscribe',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * Update (PUT) an agent_subscribe
     *
     * @header
     * @param {string} JWT token for authentication
     * @request
     * @param {string} guid
     * @payload
     * @param {string} agent_subscribe
     * @param {string} ip
     * @param {number} port
     * @param {number} mask
     * @param {string} captureID
     * @param {boolean} status
     * @return agent_subscribe guid and success message
     */
    path: '/api/v3/agent/subscribe/{guid}',
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
          host: Joi.string().min(1).max(250),
           port: Joi.number(),
           protocol: Joi.string().min(1).max(50),
           path: Joi.string().min(1).max(250),
           node: Joi.string().min(1).max(100),
           type: Joi.string().min(1).max(200),
           create_date: Joi.date(),
           expire_date: Joi.date(),
           active: Joi.boolean(),
        },
      },
      pre: [
        {
          method: async function(request, reply) {
            const {guid} = request.params;
            const settings = new AgentSubscribe({server, guid});

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== guid) {
                return reply(Boom.notFound(`the agent_subscribe with id ${guid} was not found`));
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
      const updates = pick(request.payload, ['host', 'port', 'protocol', 'path', 'node', 'type', 'create_date', 'expire_date', 'status']);

      const settings = new AgentSubscribe({server, guid});

      try {
        await settings.update(updates);
        return reply({
          data: guid,
          message: 'successfully updated agent_subscribe',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * DELETE an agent_subscribe
     *
     * @header
     * @param {string} JWT token for authentication
     * @request
     * @param {string} guid
     * @return agent_subscribe guid and success message
     */
    path: '/api/v3/agent/subscribe/{guid}',
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
            const settings = new AgentSubscribe({server, guid});

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== guid) {
                return reply(Boom.notFound(`the agent_subscribe with id ${guid} were not found`));
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
      const settings = new AgentSubscribe({server, guid});

      try {
        await settings.delete();
        return reply({
          data: guid,
          message: 'successfully deleted agent_subscribe',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });
};
