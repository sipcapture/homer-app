module.exports = {
  development: {
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      tableName: './db/tables/seeds'
    },
    /*
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'password',
      database: 'homerdatadev',
      charset: 'utf8',
    }
    */
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'homer',
      port: 5432,
      password: '123456',
      database: 'homer_config',
      charset: 'utf8',
    }
  }
};
