const pgsql = {
  host: 'localhost',
  user: 'homer',
  port: 5432,
  password: '123456',
  charset: 'utf8',
  timezone: 'utc',
  pool: {
    afterCreate: function(connection, callback) {
      connection.query('SET timezone = "UTC";', function(err) {
        callback(err, connection);
      });
    },
  },
};

const mysql = {
  host: 'localhost',
  user: 'homer_user',
  password: 'homer_password',
  charset: 'utf8',
  timezone: 'utc',
  pool: {
    afterCreate: function(connection, callback) {
      connection.query('SET time_zone = "+00:00";', function(err) {
        callback(err, connection);
      });
    },
  },
};

const influxdb = {
  host: 'influxdb',
  port: 8086,
  database: 'homer'
}

const prometheus = {
  protocol: 'http',
  host: 'prometheus',
  port: 9090,
  api: '/api/v1/'
}

const ldapauth = {
   url: 'ldap://127.0.0.1:389',
   strictDN: true,
   dn: 'dc=qxip,dc=net',
   userdn: 'uid=%USERNAME%',
   filter: '(uid=%USERNAME%)',      
   scope: 'sub',
   uidNumber: 'uidNumber'
}

export default {
  http_host: '0.0.0.0',
  http_port: 8081,
  https_host: '0.0.0.0',
  https_port: 8443,
  certificate: {
    self_signed: true,
    days: 1,
  },
  auth: {
    internal: true,
    ldap: false,
  },
  bcrypt: {
    saltRounds: 10,
  },
  db: {
    type: { // only one type can be true
      mysql: false,
      pgsql: true,
    },
    influxdb: influxdb,
    prometheus: prometheus,
    ldapauth: ldapauth,
    pgsql: {
      homer_config: {
        client: 'pg',
        connection: {
          database: 'homer_config',
          host: pgsql.host,
          user: pgsql.user,
          port: pgsql.port,
          password: pgsql.password,
          charset: pgsql.charset,
          timezone: pgsql.timezone,
        },
        pool: pgsql.pool,
      },
      homer_data: {
        client: 'pg',
        connection: {
          database: 'homer_data',
          host: pgsql.host,
          user: pgsql.user,
          port: pgsql.port,
          password: pgsql.password,
          charset: pgsql.charset,
          timezone: pgsql.timezone,
        },
        pool: pgsql.pool,
      },
    },
    mysql: {
      homerdatadev: {
        dialect: 'mysql',
        client: 'mysql',
        connection: {
          database: 'homerdatadev',
          host: mysql.host,
          user: mysql.user,
          password: mysql.password,
          charset: mysql.charset,
          timezone: mysql.timezone,
        },
        pool: mysql.pool,
      },
    },
  },
};
