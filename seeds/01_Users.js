const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');
const config = require('../server/config/server_config');

exports.seed = function seed(knex) {
  const tableName = 'users';
  const salt = bcrypt.genSaltSync(config.bcrypt.saltRounds);

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
      hash: bcrypt.hashSync('12345678', salt),
      email: 'shurik@email.com',
      guid: uuidv4(),
    },
    {
      name: 'Lorenzo Mangani',
      username: 'lorenzo',
      hash: bcrypt.hashSync('12345678', salt),
      email: 'lmangani@gmail.com',
      guid: uuidv4(),
    },
    {
      name: 'Eugene',
      username: 'negbie',
      hash: bcrypt.hashSync('12345678', salt),
      email: 'negbie@gmail.com',
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
