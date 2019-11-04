const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'global_settings';

  let empty = {};
  let lokiURL='{"host":"http://loki:3100"}'
  let promURL='{"host":"http://127.0.0.1:9090/api/v1/"}'
  let grafURL='{"host": "http://127.0.0.1:3000","user": "admin","password":"admin","token": "ABCDEF1234"}'
  
  const rows = [
    {
      guid: uuidv4(),
      param: 'lokiserver',
      partid: 1,
      category: 'search',
      data: lokiURL,
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      param: 'promserver',
      partid: 1,
      category: 'search',
      data: promURL,
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      param: 'grafana',
      partid: 1,
      category: 'search',
      data: grafURL,
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
