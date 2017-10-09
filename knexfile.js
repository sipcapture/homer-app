module.exports = {
  development: {
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      tableName: './db/tables/seeds'
    },
    client: 'mysql',
    connection: {
      host: '192.168.1.35',
      user: 'birdbase',
      password: 'password',
      database: 'birdbase',
      charset: 'utf8',
    }
  }
};
