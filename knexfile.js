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
      host: '127.0.0.1',
      user: 'root',
      password: 's1pc4ptur3',
      database: 'homerdatadev',
      charset: 'utf8',
    }
  }
};
