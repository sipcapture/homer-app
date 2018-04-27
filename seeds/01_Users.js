const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'users';
  const salt = bcrypt.genSaltSync(10)

  const rows = [
    {
      firstname: 'Sergey',
      lastname: 'Bondarenko',
      username: 'trex',
      usergroup: 'admin',
      hash: bcrypt.hashSync('password', salt),
      email: 'trex@email.com',
      guid: 'f03ede7c-b121-4112-bcc7-130a3e87988c',
    },
    {
      firstname: 'Alexandr',
      lastname: 'Dubovikov',
      username: 'shurik',
      usergroup: 'admin',
      hash: bcrypt.hashSync('12345678', salt),
      email: 'shurik@email.com',
      guid: uuidv4(),
    },
    {
      firstname: 'Lorenzo',
      lastname: 'Mangani',
      username: 'lorenzo',
      usergroup: 'admin',
      hash: bcrypt.hashSync('12345678', salt),
      email: 'lmangani@gmail.com',
      guid: uuidv4(),
    },
    {
      firstname: 'Eugene',
      lastname: 'Negbie',
      username: 'negbie',
      usergroup: 'admin',
      hash: bcrypt.hashSync('12345678', salt),
      email: 'negbie@gmail.com',
      guid: uuidv4(),
    },
  ];

  return knex(tableName)
    // Empty the table (DELETE)
    .del()
    .then(function() {
      return knex.insert(rows).into(tableName);
    });
};
