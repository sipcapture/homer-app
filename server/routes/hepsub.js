import uuid from 'uuid/v4';
import {pick} from 'lodash';
import Joi from 'joi';
import Boom from 'boom';
import HepSubData from '../classes/hepsubdata';

export default function search(server) {
  server.route({
    path: '/api/v3/hepsub/protocols',
    method: 'GET',
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    handler: function(request, reply) {
      const hepsubdata = new HepSubData({server});
     
      hepsubdata.getProtocols().then(function(data) {
        if (!data) {
          return reply(Boom.notFound('data was not found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });

  server.route({
    path: '/api/v3/hepsub/fields/{id}/{transaction}',
    method: 'GET',
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    handler: function(request, reply) {
      let id = encodeURIComponent(request.params.id);
      let transaction = encodeURIComponent(request.params.transaction);
      
      const hepsubdata = new HepSubData({server});

      hepsubdata.getFields(id, transaction).then(function(data) {
        if (!data) {
          return reply(Boom.notFound('data was not found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });
  
  server.route({
    /**
     * GET all hepsub settings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @return {array} list of hepsub data
     */
    path: '/api/v3/hepsub/protocol',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
      cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
      },
    },
    handler: async function(request, reply) {
      const settings = new HepSubData({server});

      try {
        const data = await settings.getAll(['guid', 'profile', 'hepid', 'hep_alias', 'version', 'mapping']);
        if (!data || !data.length) {
          return reply(Boom.notFound('no hepsub settings found'));
        }
  
        data.sort(function(a, b){
              if(a.guid < b.guid) { return -1; }
              if(a.guid > b.guid) { return 1; }
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
     * GET hepsub settings by guid
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @return {array} list of hepsub data
     */
    path: '/api/v3/hepsub/protocol/{guid}',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
      cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
      },
      validate: {
        params: {
          guid: Joi.string().min(12).max(46).required(),
        },
      },
    },
    handler: async function(request, reply) {
      const {guid} = request.params;
      const settings = new HepSubData({server, guid});

      try {
        const data = await settings.getAll(['guid', 'profile', 'hepid', 'hep_alias', 'version', 'mapping']);
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
     * Create (POST) a new hepsub settings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @payload
     *  @param {number} partid
     *  @param {string} category
     *  @param {string} param
     *  @param {string} data
     * @return hepsub settings guid and success message
     */
    path: '/api/v3/hepsub/protocol',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token',
      },
      cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
      },
      /*
      validate: {
        payload: {
          partid: Joi.number().required(),
          category: Joi.string().min(3).max(50).required(),
          param: Joi.string().min(3).max(50).required(),
          data: Joi.string(),
        },
      },
      */
    },
    handler: async function(request, reply) {
      const {profile, hepid, hep_alias, version, mapping} = request.payload;
      const guid = uuid();
      const settings = new HepSubData({server});

      try {
        await settings.add({profile, hepid, hep_alias, version, mapping});
        return reply({
          data: guid,
          message: 'successfully created hepsub settings',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * Update (PUT) an hepsub setttings
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
     * @return hepsub settings guid and success message
     */
    path: '/api/v3/hepsub/protocol/{guid}',
    method: 'PUT',
    config: {
      auth: {
        strategy: 'token',
      },
      cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
      },
      validate: {
        params: {
          guid: Joi.string().min(12).max(46).required(),
        },
        /*
        payload: {
          partid: Joi.number(),
          category: Joi.string().min(3).max(50),
          param: Joi.string().min(3).max(50),
          data: Joi.string(),
        },
        */
      },
      pre: [
        {
          method: async function(request, reply) {
            const {guid} = request.params;
            const settings = new HepSubData({server, guid});

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== guid) {
                return reply(Boom.notFound(`the hepsub settings with id ${guid} was not found`));
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
      const updates = pick(request.payload, ['guid', 'profile', 'hepid', 'hep_alias', 'version', 'mapping']);

      const settings = new HepSubData({server, guid});

      try {
        await settings.update(updates);
        return reply({
          data: guid,
          message: 'successfully updated hepsub settings',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * DELETE an hepsub settings
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} guid
     * @return hepsub settings guid and success message
     */
    path: '/api/v3/hepsub/protocol/{guid}',
    method: 'DELETE',
    config: {
      auth: {
        strategy: 'token',
      },
      cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
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
            const settings = new HepSubData({server, guid});

            try {
              const res = await settings.get(['guid']);
              if (!res || !res.guid || res.guid !== guid) {
                return reply(Boom.notFound(`the hepsub settings with id ${guid} were not found`));
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
      const settings = new HepSubData({server, guid});

      try {
        await settings.delete();
        return reply({
          data: guid,
          message: 'successfully deleted hepsub settings',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });
};
