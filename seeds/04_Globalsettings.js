const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'global_settings';

  let empty = {};
  let lokiHome='{"host":"http://127.0.0.1:3100"}'
  
  const rows = [
    {
      guid: uuidv4(),
      param: 'lokiserver',
      partid: 1,
      category: 'test',
      data: lokiHome,
      create_date: new Date(),
    },
  ];

  return knex(tableName)
    // Empty the table (DELETE)
    .del()
    .then(function() {
      return knex.insert(rows).into(tableName);
    });
};
