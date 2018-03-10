import Joi from 'joi';
import Boom from 'boom';
import Protocol from '../classes/protocol';

export default [
  {
    /**
     * Get (GET) protocol transactions by type and transaction name
     *
     * @header
     *  @param {string} JWT token - authentication
     * @request
     *  @param {integer} type - type of transaction
     *  @param {string} transaction - transaction name
     */
    path: '/api/v3/protocol/{type}/{transaction}/_discover',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token'
      },
      validate: {
        params: {
          type: Joi.number().integer().min(0).max(25000).required(),
          transaction: Joi.string().min(2).max(250).required()
        }
      }
    },
    handler: function (request, reply) {
      const { type } = request.params;
      const { transaction } = request.params;
      const protocol = new Protocol();

      protocol.discover(type, transaction)
        .then(function (data) {
          if (!data) {
            return reply(Boom.notFound('no transaction found'));
          }
  
          return reply({
            count: data.length,
            data
          }).code(201);
  
        })
        .catch(function (error) {
          return reply(Boom.serverUnavailable(error));
        });
    }
  }
];
