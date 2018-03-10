import Hapi from 'hapi';
import {forEach} from 'lodash';
import pem from 'pem';
import jwtSettings from './private/jwt_settings';
import config from './config/server_config';
import proxyConfig from './config/proxy'; // temporary, to be deleted when the new API is ready

const routes = {
  auth: require('./routes/authentication'),
  birds: require('./routes/birds'),
  ui: require('./routes/ui'),
  proxy: require('./routes/proxy'),
};

const server = new Hapi.Server({
  debug: {
    log: ['error', 'implementation', 'internal'],
    request: ['error', 'implementation', 'internal'],
  },
});

pem.createCertificate({
  days: config.certificate.days,
  selfSigned: config.certificate.self_signed,
}, function(error, keys) {
  if (error) {
    throw error;
  }
  
  const tls = {
    key: keys.serviceKey,
    cert: keys.certificate,
  };
  
  server.connection({
    port: config.http_port,
  });
  
  server.connection({
    port: config.https_port,
    tls,
  });
  
  // JWT authentication and encryption
  server.register([
    require('h2o2'),
    require('hapi-auth-jwt'),
    require('inject-then'),
    require('inert'),
  ], function(error) {
    if (error) {
      console.log('Error was handled!');
      console.log(error);
    }
  
    server.auth.strategy('token', 'jwt', {
      key: jwtSettings.key, // the JWT private key
      verifyOptions: {
        algorithms: [jwtSettings.algorithm],
      },
    });
  
    // Initialize routes
    forEach(routes, function(routeSet) {
      if (routeSet.default.name === 'proxy') { // temporary, to be deleted when the new API is ready
        routeSet.default(server, proxyConfig);
      } else {
        routeSet.default(server);
      }
    });
  });
  
  // Server start
  server.start(function(error) {
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
