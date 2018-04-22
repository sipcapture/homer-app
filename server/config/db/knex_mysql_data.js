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
  pool: {
    afterCreate: function(connection, callback) {
      connection.query('SET time_zone = "+00:00";', function(err) {
        callback(err, connection);
      });
    }
 }
});
