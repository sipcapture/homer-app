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
     * GET agent_subscribe by uuid
     *
     * @header
     * @param {string} JWT token for authentication
     * @request
     * @param {string} uuid
     * @return {array} list of agent_subscribe data
     */
    path: '/api/v3/agent/subscribe/{uuid}',
    method: 'GET',
    config: {
      validate: {
        params: {
          uuid: Joi.string().min(12).max(46).required(),
        },
      },
    },
    handler: async function(request, reply) {
      const {uuid} = request.params;
      const settings = new AgentSubscribe({server, uuid});

      try {
        const data = await settings.get(['guid', 'host', 'port', 'protocol', 'path', 'node', 'type','create_date','expire_date']);
        if (!data || !Object.keys(data).length) {
          return reply(Boom.notFound('no agent_subscribe found for uuid ' + uuid));
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
     * @return agent_subscribe uuid and success message
     */
    path: '/api/v3/agent/subscribe',
    method: 'POST',
    config: {
      validate: {
        payload: {
           uuid: Joi.string().min(12).max(46).required(),
           gid: Joi.number(),
           host: Joi.string().min(1).max(250),
           port: Joi.number(),
           protocol: Joi.string().min(1).max(50),
           path: Joi.string().min(1).max(250),
           node: Joi.string().min(1).max(100),
           type: Joi.string().min(1).max(200),
           ttl: Joi.number(),
        },
      },
    },
    handler: async function(request, reply) {
      const {uuid, gid, host, port, protocol, path, node, type, ttl} = request.payload;
      const guid = uuid;
      const create_date = new Date();
      const expire_date = new Date(create_date);
      expire_date.setSeconds(create_date.getSeconds()+ttl);     
      const settings = new AgentSubscribe({server, guid});

      try {
        await settings.delete();        
        await settings.add({guid, gid, host, port, protocol, path, node, type, create_date, expire_date});
        return reply({
          data: uuid,
          message: 'successfully created agent_subscribe',
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
     * @param {string} uuid
     * @return agent_subscribe uuid and success message
     */
    path: '/api/v3/agent/subscribe/{uuid}',
    method: 'DELETE',
    config: {
      validate: {
        params: {
          uuid: Joi.string().min(12).max(46).required(),
        },
      },
      pre: [
        {
          method: async function(request, reply) {
            const {uuid} = request.params;
            const settings = new AgentSubscribe({server, uuid});
            const guid = uuid;

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== uuid) {
                return reply(Boom.notFound(`the agent_subscribe with id ${uuid} were not found`));
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
      const {uuid} = request.params;
      const settings = new AgentSubscribe({server, uuid});

      try {
        await settings.delete();
        return reply({
          data: uuid,
          message: 'successfully deleted agent_subscribe',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });
};
