const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'mapping_schema';

  const rows = [
    {
      guid: uuidv4(),
      profile: 'default',
      hepid: 1,
      gid: 10,
      version: 1,
      retention: 10,
      partition_step: 10,
      create_index: '',      
      create_table: '',
      fields_mapping: '',
      schema_mapping: '',
      schema_settings: '',
      create_date: new Date(),
    }
  ];

  return knex(tableName)
    // Empty the table (DELETE)
    .del()
    .then(function () {
      return knex.insert(rows).into(tableName);
    });
};
