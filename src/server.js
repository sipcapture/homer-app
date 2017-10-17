import Hapi from 'hapi';
import { forEach } from 'lodash';
import jwtSettings from './private/jwt_settings';
import authRoutes from './routes/authentication';
import birdsRoutes from './routes/birds';

const server = new Hapi.Server();

server.connection({
  port: 8080
});

// JWT authentication and encryption
server.register([
  require('hapi-auth-jwt'),
  require('inject-then')
], function (error) {
  if (error) {
    console.log('Error was handled!');
    console.log(error);
  }

  server.auth.strategy('token', 'jwt', {
    key: jwtSettings.key, // the JWT private key
    verifyOptions: {
      algorithms: [ jwtSettings.algorithm ],
    }
  });

  // Initialize routes
  forEach([authRoutes, birdsRoutes], function (routes) {
    forEach(routes, function (route) {
      server.route(route);
    });
  });
});

// Server start
server.start(function (error) {
  if (error) {
    console.log('Error was handled!');
    console.log(error);
  }
  console.log(`Server started at ${server.info.uri}`);
});

export default server;
