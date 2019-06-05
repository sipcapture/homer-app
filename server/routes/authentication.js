import jwt from 'jsonwebtoken';
import jwtSettings from '../private/jwt_settings';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import Boom from 'boom';
import User from '../classes/user';
import LdapAuth from '../classes/ldap';
import config from '../config';

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
    path: '/api/v3/auth',
    method: 'POST',
    config: {
      validate: {
        payload: {
          username: Joi.string().min(2).max(50).required(),
          password: Joi.string().min(2).max(250).required(),
        },
      },
    },
    handler: async function(request, reply) {
      const {username, password} = request.payload;      
      let user;
      
      if(config.auth && config.auth.ldap) {
          let ldapAuth = config.db.ldapauth;
          user = new LdapAuth({ldapAuth, username, password});          
          let response = await user.get(['guid', 'hash']);
          
          console.log("USER RESPONSE", response);                    
          if (response.auth) {
             const token = jwt.sign({username, scope: response.guid, }, jwtSettings.key, 
             {
                algorithm: jwtSettings.algorithm,
                expiresIn: jwtSettings.expires_in,
             });                          
             return reply({token, scope: response.guid,});
          } else {
              return reply(Boom.unauthorized('incorrect password'));
          }
      }	
      /* default internal */
      else {
          user = new User({server, username});
          user.get(['guid', 'hash']).then(function(user) {
      
              if (!user) {
                    return reply(Boom.notFound('the user was not found'));
              }

              return bcrypt.compare(password, user.hash).then(function(isCorrect) {
                      if (isCorrect) {
                          const token = jwt.sign({username, scope: user.guid, }, jwtSettings.key, 
                          {
                            algorithm: jwtSettings.algorithm,
                            expiresIn: jwtSettings.expires_in,
                          });
                          
                          return reply({token, scope: user.guid,});
                     } else {
                            return reply(Boom.unauthorized('incorrect password'));
                     }
              });
      
        
          }).catch(function(error) {
              return reply(Boom.serverUnavailable(error));
          });
      }
    },
  });
};
