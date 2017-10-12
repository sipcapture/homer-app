import Knex from '../db/knex';
import uuid from 'uuid/v4';
import Joi from 'joi';
import Boom from 'boom';

export default [
  // GET info about all isPublic birds
  {
    path: '/api/v2/birds',
    method: 'GET',
    handler: function (request, reply) {
      Knex('birds')
        .where({
          isPublic: true
        })
        .select('name', 'species', 'picture_url')
        .then(function (data) {
          if (!data || !data.length) {
            reply(Boom.notFound('no public bird found')).takeover();
          }
  
          reply({
            count: data.length,
            data
          });
  
        })
        .catch(function (error) {
          reply(Boom.serverUnavailable(error));
        });
    }
  },
  // Create a bird
  {
    path: '/api/v2/birds',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
      validate: {
        payload: {
          name: Joi.string().min(2).max(250).required(),
          species: Joi.string().min(2).max(250).required(),
          picture_url: Joi.string().min(10).max(250).required()
        }
      }
    },
    handler: function (request, reply) {
      const { name, species, picture_url } = request.payload;
      const guid = uuid();

      Knex('birds')
        .insert({
          owner: request.auth.credentials.scope,
          name,
          species,
          picture_url,
          guid,
        })
        .then(function () {
          reply({
            data: guid,
            message: 'successfully created bird'
          }).code(201);
        })
        .catch(function (error) {
          reply(Boom.serverUnavailable(error));
        });
    }
  },
  // Update bird
  {
    path: '/api/v2/birds/{birdGuid}',
    method: 'PUT',
    config: {
      auth: {
        strategy: 'token'
      },
      validate: {
        params: {
          birdGuid: Joi.string().min(12).max(46).required()
        },
        payload: {
          name: Joi.string().min(2).max(250).required(),
          species: Joi.string().min(2).max(250).required(),
          picture_url: Joi.string().min(10).max(250).required(),
          isPublic: Joi.number().integer().min(0).max(1).required()
        }
      },
      pre: [
        {
          method: function (request, reply) {
            const { birdGuid } = request.params;
            const { scope } = request.auth.credentials;

            Knex('birds')
              .where({
                guid: birdGuid
              })
              .select('owner')
              .then(function ([result]) {
                if (!result) {
                  reply(Boom.notFound(`the bird with id ${birdGuid} was not found`)).takeover();
                }

                if (result.owner !== scope) {
                  reply(Boom.unauthorized(`the bird with id ${birdGuid} is not in the user scope`)).takeover();
                }

                return reply.continue();
              });
          }
        }
      ]
    },
    handler: function (request, reply) {
      const { name, species, picture_url, isPublic } = request.payload;
      const { birdGuid } = request.params;

      Knex('birds')
        .where({
          guid: birdGuid
        })
        .update({
          name,
          species,
          picture_url,
          isPublic,
        })
        .then(function () {
          reply({
            message: 'successfully updated bird'
          });
        })
        .catch(function (error) {
          reply(Boom.serverUnavailable(error));
        });
    }
  }
];
