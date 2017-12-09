export default require('knex')({
  dialect: 'mysql',
  client: 'mysql',
  connection: {
    host: '192.168.1.35',
    user: 'birdbase',
    password: 'password',
    database: 'birdbase',
    charset: 'utf8',
  }
});
