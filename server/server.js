import Hapi from 'hapi';
import {forEach} from 'lodash';
import pem from 'pem';
import jwtSettings from './private/jwt_settings';
import config from './config/server_config';
import proxyConfig from './config/proxy'; // temporary, to be deleted when the new API is ready

const routes = {
  auth: require('./routes/authentication'),
  search: require('./routes/search'),
  mapping: require('./routes/mapping'),
  birds: require('./routes/birds'),
  ui: require('./routes/ui'),
  proxy: require('./routes/proxy'),
  any: require('./routes/any'),
  users: require('./routes/users'),
  dashboard: require('./routes/dashboard'),
  statistics: require('./routes/statistics'),
};

const databases = {
  data: config.db.type.mysql ? require('./config/db/knex_mysql_data').default : require('./config/db/knex_pgsql_data').default,
  config: config.db.type.mysql ? require('./config/db/knex_mysql_config').default : require('./config/db/knex_pgsql_config').default,
};

const server = new Hapi.Server({
  debug: {
    log: ['debug', 'warn', 'error', 'implementation', 'internal'],
    request: ['debug', 'warn', 'error', 'implementation', 'internal'],
  },
});

const Influx = require('influx');
const influx = new Influx.InfluxDB({
  host: '127.0.0.1',
  port: 8086,    
  database: 'hep',
});

databases.statistics = influx;

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
    host: config.http_host || '127.0.0.1',
    port: config.http_port || 8001,
  });
  
  server.connection({
    host: config.https_host || '127.0.0.1',
    port: config.https_port || 443,
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

    server.databases = databases;
  
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
