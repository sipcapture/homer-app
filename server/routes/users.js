import uuid from 'uuid/v4';
import {pick} from 'lodash';
import Joi from 'joi';
import Boom from 'boom';
import bcrypt from 'bcryptjs';
import User from '../classes/user';
import config from '../config/server_config';

export default function users(server) {
  server.route({
    /**
     * GET all users
     *
     * @header
     *  @param {string} JWT token for authentication
     * @return {array} list of users data
     */
    path: '/api/v3/users',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: async function(request, reply) {
      const user = new User({server});

      try {
        const data = await user.getAll(['name', 'username', 'email', 'guid']);
        if (!data || !data.length) {
          return reply(Boom.notFound('no users found'));
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
     * Create (POST) a new user
     *
     * @header
     *  @param {string} JWT token for authentication
     * @payload
     *  @param {string} name
     *  @param {string} username
     *  @param {string} email
     *  @param {string} password
     * @return user guid and success message
     */
    path: '/api/v3/users',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        payload: {
          name: Joi.string().min(3).max(50).required(),
          username: Joi.string().min(3).max(50).required(),
          email: Joi.string().min(6).max(250).required(),
          password: Joi.string().min(8).max(250).required(),
        },
      },
    },
    handler: async function(request, reply) {
      const {name, username, email, password} = request.payload;
      const guid = uuid();
      const salt = bcrypt.genSaltSync(config.bcrypt.saltRounds);
      const hash = bcrypt.hashSync(password, salt);
      const user = new User({server});

      try {
        await user.add({name, username, email, guid, hash});
        return reply({
          data: guid,
          message: 'successfully created user',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * Update (PUT) an user
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} userGuid
     * @payload
     *  @param {string} name
     *  @param {string} username
     *  @param {string} email
     *  @param {string} password
     */
    path: '/api/v3/users/{userGuid}',
    method: 'PUT',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        params: {
          userGuid: Joi.string().min(12).max(46).required(),
        },
        payload: {
          name: Joi.string().min(3).max(50),
          username: Joi.string().min(3).max(50),
          email: Joi.string().min(6).max(250),
          password: Joi.string().min(6).max(250),
        },
      },
      pre: [
        {
          method: async function(request, reply) {
            const {userGuid} = request.params;
            const user = new User({server, guid: userGuid});

            try {
              const res = await user.get(['guid']);
              if (!res || !res.guid || res.guid !== userGuid) {
                return reply(Boom.notFound(`the user with id ${userGuid} was not found`));
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
      const {userGuid} = request.params;
      const updates = pick(request.payload, ['name', 'username', 'email', 'password']);
      
      if (updates.password) {
        const salt = bcrypt.genSaltSync(config.bcrypt.saltRounds);
        updates.hash = bcrypt.hashSync(updates.password, salt);
        delete updates.password;
      }

      const user = new User({server, guid: userGuid});

      try {
        await user.update(updates);
        return reply({
          data: userGuid,
          message: 'successfully updated user',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });

  server.route({
    /**
     * DELETE an user
     *
     * @header
     *  @param {string} JWT token for authentication
     * @request
     *  @param {string} userGuid
     */
    path: '/api/v3/users/{userGuid}',
    method: 'DELETE',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        params: {
          userGuid: Joi.string().min(12).max(46).required(),
        },
      },
      pre: [
        {
          method: async function(request, reply) {
            const {userGuid} = request.params;
            const user = new User({server, guid: userGuid});

            try {
              const res = await user.get(['guid']);
              if (!res || !res.guid || res.guid !== userGuid) {
                return reply(Boom.notFound(`the user with id ${userGuid} was not found`));
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
      const {userGuid} = request.params;
      const user = new User({server, guid: userGuid});

      try {
        await user.delete();
        return reply({
          data: userGuid,
          message: 'successfully deleted user',
        }).code(201);
      } catch (err) {
        return reply(Boom.serverUnavailable(err));
      }
    },
  });
};
