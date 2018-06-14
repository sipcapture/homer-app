const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'users';
  const salt = bcrypt.genSaltSync(10);

  const rows = [
    {
      firstname: 'Homer',
      lastname: 'Admin',
      username: 'admin',
      usergroup: 'admin',
      hash: bcrypt.hashSync('sipcapture', salt),
      email: 'root@localhost',
      guid: '11111111-1111-1111-1111-111111111111',
    },
    {
      firstname: 'Homer',
      lastname: 'Support',
      username: 'support',
      usergroup: 'admin',
      hash: bcrypt.hashSync('sipcapture', salt),
      email: 'root@localhost',
      guid: '22222222-2222-2222-2222-222222222222',
    }
  ];

  return knex(tableName)
    // Empty the table (DELETE)
    .del()
    .then(function() {
      return knex.insert(rows).into(tableName);
    });
};
