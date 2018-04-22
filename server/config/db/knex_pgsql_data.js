export default require('knex')({
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'homer',
    port: 5432,
    password: '123456',
    database: 'homer_data',
    charset: 'utf8',
    timezone     : 'utc',        
  },
});
