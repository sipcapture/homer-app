import Hapi from 'hapi';
import {forEach} from 'lodash';
import pem from 'pem';
import jwtSettings from './private/jwt_settings';
import config from './config';

const routes = {
  auth: require('./routes/authentication'),
  search: require('./routes/search'),
  remote: require('./routes/remote'),
  export: require('./routes/export'),
  mapping: require('./routes/mapping'),
  hepsub: require('./routes/hepsub'),
  birds: require('./routes/birds'),
  profile: require('./routes/profile'),
  prometheus: require('./routes/prometheus'),
  users: require('./routes/users'),
  user_settings: require('./routes/user_settings'),
  alias: require('./routes/alias'),
  advanced: require('./routes/advanced'),
  dashboard: require('./routes/dashboard'),
  statistics: require('./routes/statistics'),
  agent_subscribe: require('./routes/agent_subscribe'),
  any: require('./routes/any'),
};

const databases = {
  data: require('knex')(config.db.pgsql.homer_data),
  config: require('knex')(config.db.pgsql.homer_config),
};

const server = new Hapi.Server({
  debug: {
    log: ['debug', 'warn', 'error', 'implementation', 'internal'],
    request: ['debug', 'warn', 'error', 'implementation', 'internal'],
  },
});


const Influx = require('influx');
const influx = new Influx.InfluxDB({
  host: config.db.influxdb.host || '127.0.0.1',
  port: config.db.influxdb.port || 8086,
  database: config.db.influxdb.database || 'homer',
});

databases.statistics = influx;

/* prometheus */
const RequestClient = require('reqclient').RequestClient;
const prometheusClient = new RequestClient({
  baseUrl: config.db.prometheus.protocol + '://' + config.db.prometheus.host + ':' + config.db.prometheus.port + config.db.prometheus.api
});

databases.prometheus = prometheusClient;

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
