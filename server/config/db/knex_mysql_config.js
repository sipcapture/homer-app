export default require('knex')({
  dialect: 'mysql',
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'homer',
    password: 'password',
    database: 'homerdatadev',
    charset: 'utf8',
    timezone     : 'utc',        
  },
});
