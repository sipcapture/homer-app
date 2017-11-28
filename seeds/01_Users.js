const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'users';
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);

  const rows = [
    {
      name: 'Sergey Bondarenko',
      username: 'trex',
      hash: bcrypt.hashSync('password', salt),
      email: 'trex@email.com',
      guid: 'f03ede7c-b121-4112-bcc7-130a3e87988c',
    },
    {
      name: 'Alexandr Dubovikov',
      username: 'shurik',
      hash: bcrypt.hashSync('123456', salt),
      email: 'shurik@email.com',
      guid: uuidv4(),
    }
  ];

  return knex(tableName)
    // Empty the table (DELETE)
    .del()
    .then(function () {
      return knex.insert(rows).into(tableName);
    });
};
