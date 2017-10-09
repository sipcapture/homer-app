import Knex from '../db/knex';
import GUID from 'node-uuid';

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
            reply({
              error: true,
              message: 'no public bird found'
            });
          }
  
          reply({
            count: data.length,
            data
          });
  
        })
        .catch(function (error) {
          reply({
            error: true,
            message: error
          });
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
      }
    },
    handler: function (request, reply) {
      if (!request.payload) {
        reply({
          error: true,
          message: 'request is malformed'
        });
        return;
      }

      const { name, species, picture_url } = request.payload;
      const guid = GUID.v4();

      if (!name || !species || !picture_url) {
        reply({
          error: true,
          message: 'you have to specify bird properties: name, species and picture_url'
        });
        return;
      }

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
          });
        })
        .catch(function (error) {
          reply({
            error: true,
            message: error
          });
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
                  reply({
                    error: true,
                    message: `the bird with id ${birdGuid} was not found`
                  }).takeover();
                }

                if (result.owner !== scope) {
                  reply({
                    error: true,
                    message: `the bird with id ${birdGuid} is not in the current scope`
                  }).takeover();
                }

                return reply.continue();
              });
          }
        }
      ]
    },
    handler: function (request, reply) {
      if (!request.payload) {
        reply({
          error: true,
          message: 'request is malformed'
        });
        return;
      }

      const { name, species, picture_url, isPublic } = request.payload;
      const { birdGuid } = request.params;

      if (!name || !species || !picture_url) {
        reply({
          error: true,
          message: 'you have to specify bird properties: name, species and picture_url'
        });
        return;
      }

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
          reply({
            error: true,
            message: error
          });
        });
    }
  }
];
