exports.seed = function seed(knex) {
  const tableName = 'users';
  const rows = [
    {
      name: 'Sergey Bondarenko',
      username: 'trex',
      password: 'password',
      email: 'trex@email.com',
      guid: 'f03ede7c-b121-4112-bcc7-130a3e87988c',
    }
  ];

  return knex(tableName)
    // Empty the table (DELETE)
    .del()
    .then(function () {
      return knex.insert(rows).into(tableName);
    });
};
