import Hapi from 'hapi';
import { forEach } from 'lodash';
import pem from 'pem';
import jwtSettings from './private/jwt_settings';
import authRoutes from './routes/authentication';
import birdsRoutes from './routes/birds';
import protocolRoutes from './routes/protocol';

const server = new Hapi.Server();

pem.createCertificate({
  days: 1,
  selfSigned: true
}, function (error, keys) {
  if (error) {
    throw error;
  }
  
  const tls = {
    key: keys.serviceKey,
    cert: keys.certificate
  };
  
  server.connection({
    port: 8001
  });
  
  server.connection({
    port: 8000,
    tls
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
    forEach([authRoutes, birdsRoutes, protocolRoutes], function (routes) {
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
  
    if (server.info) {
      console.log(`Server started at ${server.info.uri}`);
    } else {
      console.log('Server started');
    }
  });

});

export default server;
