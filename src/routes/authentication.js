import Knex from '../db/knex';
import jwt from 'jsonwebtoken';
import jwtSettings from '../private/jwt_settings';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import Boom from 'boom';

export default [
  // Authenticate user
  {
    path: '/api/v2/auth',
    method: 'POST',
    config: {
      validate: {
        payload: {
          username: Joi.string().min(4).max(50).required(),
          password: Joi.string().min(8).max(80).required()
        }
      }
    },
    handler: function (request, reply) {
      const { username, password } = request.payload;

      Knex('users')
        .where({
          username,
        })
        .select('guid', 'hash')
        .then(function ([user]) {
          if (!user) {
            reply(Boom.notFound('the user was not found')).takeover();
          }

          return bcrypt.compare(password, user.hash)
            .then(function (isCorrect) {
              if (isCorrect) {
                const token = jwt.sign({
                  username,
                  scope: user.guid
                }, jwtSettings.key,
                {
                  algorithm: jwtSettings.algorithm,
                  expiresIn: jwtSettings.expires_in
                });

                reply({
                  token,
                  scope: user.guid
                });
              } else {
                reply(Boom.unauthorized('incorrect password'));
              }
            });
        })
        .catch(function (error) {
          reply(Boom.serverUnavailable(error));
        });
    }
  }
];
