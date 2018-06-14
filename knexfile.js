require('babel-register');
const config = require('./server/config').default;

module.exports = {
  development: {
    migrations: {
      tableName: 'knex_migrations',
    },
    seeds: {
      tableName: './db/tables/seeds',
    },
    client: 'pg',
    connection: config.db.pgsql.homer_config.connection,
  },
};
