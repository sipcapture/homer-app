import Joi from 'joi';
import Boom from 'boom';
import SearchData from '../classes/searchdata';

export default function auth(server) {
  server.route({
    /**
     * Authenticate user
     *
     * @payload
     *  @param {string} username
     *  @param {string} password
     *  @return {object} JWT token and user guid - { token: 'jwt tocken string', scope: 'user guid' }
     */
    path: '/api/v3/search/call/data',
    method: 'POST',
    config: {
      validate: {
        payload: {
          param: {
            transaction: Joi.object(),
            limit: Joi.number().integer().min(0),          
            location: Joi.object(),
            search: Joi.object(),
            timezone: Joi.object(),            
          },
          timestamp: {
              //from: Joi.string().min(4).max(50).required(),
              from: Joi.date().timestamp().required(),
              to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: function(request, reply) {
    
      console.log("REQUEST", request.payload);
    
      //const {username, password} = request.payload;
      const searchdata = new SearchData(request.payload);

      searchdata.get(['id', 'gid', 'hep_header','payload','raw']).then(function(data) {
        if (!data) {
          return reply(Boom.notFound('data was not found'));          
        }

        return reply(data); 
        //return reply({token,scope: user.guid,});
        //return reply(Boom.unauthorized('incorrect password'));
        
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });
};
