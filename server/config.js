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
  user: 'homer',
  password: 'password',
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

export default {
  http_host: '0.0.0.0',
  http_port: 8001,
  https_host: '0.0.0.0',
  https_port: 4433,
  certificate: {
    self_signed: true,
    days: 1,
  },
  bcrypt: {
    saltRounds: 10,
  },
  db: {
    type: { // only one type can be true
      mysql: false,
      pgsql: true,
    },
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
