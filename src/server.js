import Hapi from 'hapi';
import { forEach } from 'lodash';
import jwtSettings from './private/jwt_settings';
import systemRoutes from './routes/system';
import birdsRoutes from './routes/birds';

const server = new Hapi.Server();

server.connection({
  port: 8080
});

// JWT authentication and encryption
server.register(require('hapi-auth-jwt'), function (error) {
  if (error) {
    console.log('Error was handled!');
    console.log(error);
  }

  server.auth.strategy('token', 'jwt', {
    key: jwtSettings.key, // the private key
    verifyOptions: {
      algorithms: [ jwtSettings.algorithm ],
    }
  });

  // Routes
  forEach([systemRoutes, birdsRoutes], function (routes) {
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
