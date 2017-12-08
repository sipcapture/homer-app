export default require('knex')({
  dialect: 'mysql',
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: 's1pc4ptur3',
    database: 'homerdatadev',
    charset: 'utf8',
  }
});
