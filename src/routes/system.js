import Knex from '../db/knex';
import jwt from 'jsonwebtoken';
import jwtSettings from '../private/jwt_settings';
import bcrypt from 'bcrypt';

export default [
  // Authenticate user
  {
    path: '/api/v2/auth',
    method: 'POST',
    handler: function (request, reply) {
      if (!request.payload) {
        reply({
          error: true,
          message: 'request is malformed'
        });
        return;
      }

      const { username, password } = request.payload;

      if (!username || !password || !username.length || !password.length) {
        reply({
          error: true,
          message: 'username or password was not set'
        });
        return;
      }

      Knex('users')
        .where({
          username,
        })
        .select('guid', 'hash')
        .then(function ([user]) {
          if (!user) {
            reply({
              error: true,
              message: 'the user was not found'
            });
            return;
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
                reply({
                  message: 'incorrect password'
                });
              }
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
