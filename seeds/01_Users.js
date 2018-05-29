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
      guid: 'f03ede7c-b121-4112-bcc7-130a3e87988c',
    },
    {
      firstname: 'Homer',
      lastname: 'Support',
      username: 'support',
      usergroup: 'admin',
      hash: bcrypt.hashSync('sipcapture', salt),
      email: 'root@localhost',
      guid: uuidv4(),
    }
  ];

  return knex(tableName)
    // Empty the table (DELETE)
    .del()
    .then(function() {
      return knex.insert(rows).into(tableName);
    });
};
