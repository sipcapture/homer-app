const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'mapping_schema';

  let empty = {};
            
  const rows = [
    {
      guid: uuidv4(),
      profile: 'default',
      hepid: 1,
      gid: 10,
      version: 1,
      retention: 10,
      partition_step: 10,
      create_index: JSON.stringify(empty),
      create_table: 'CREATE TABLE test(id integer, data text);',
      fields_mapping: JSON.stringify(empty),
      schema_mapping: JSON.stringify(empty),
      schema_settings: JSON.stringify(empty),
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
