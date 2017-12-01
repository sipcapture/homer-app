import uuid from 'uuid/v4';
import Joi from 'joi';
import Boom from 'boom';
import Bird from '../classes/bird';

export default [
  {
    /**
     * GET all public birds
     *
     * @return list of birds data
     */
    path: '/api/v3/birds',
    method: 'GET',
    handler: function (request, reply) {
      const bird = new Bird();

      bird.getAll(['name', 'species', 'picture_url'])
        .then(function (data) {
          if (!data || !data.length) {
            reply(Boom.notFound('no public bird found'));
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
  {
    /**
     * Create (POST) a new bird
     *
     * @header
     *  @param {string} JWT token - authentication
     * @payload
     *  @param {string} name
     *  @param {string} species
     *  @param {string} picture_url
     * @return bird guid
     */
    path: '/api/v3/birds',
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
      const bird = new Bird();

      bird.add({
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
  {
    /**
     * Update (PUT) a bird
     *
     * @header
     *  @param {string} JWT token - authentication
     * @request
     *  @param {string} birdGuid - id of a bird
     * @payload
     *  @param {string} name
     *  @param {string} species
     *  @param {string} picture_url
     *  @param {boolean} isPublic
     */
    path: '/api/v3/birds/{birdGuid}',
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
            const bird = new Bird(birdGuid);

            bird.get(['owner'])
              .then(function (result) {
                if (!result) {
                  reply(Boom.notFound(`the bird with id ${birdGuid} was not found`));
                }

                if (result.owner !== scope) {
                  reply(Boom.unauthorized(`the bird with id ${birdGuid} is not in the user scope`));
                }

                return reply.continue();
              })
              .catch(function (error) {
                reply(Boom.serverUnavailable(error));
              });
          }
        }
      ]
    },
    handler: function (request, reply) {
      const { name, species, picture_url, isPublic } = request.payload;
      const { birdGuid } = request.params;
      const bird = new Bird(birdGuid);

      bird.update({
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
