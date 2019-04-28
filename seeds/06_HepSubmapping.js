const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'hepsub_mapping_schema';

  let empty = {};

  let correlationMapping1default = [
    {
      source_field: 'data_header.callid',
      lookup_id: 0,
      lookup_type: "pubsub",
      lookup_profile: 'cdr',
      lookup_field: '{"data":"$source_field"}',
      lookup_range: [-300, 200],
    },
  ];
                
  const rows = [
    {
      guid: uuidv4(),
      profile: 'default',
      hepid: 1,
      hep_alias: 'SIP',
      version: 1,
      mapping: JSON.stringify(correlationMapping1default),
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      profile: 'call',
      hepid: 1,
      hep_alias: 'SIP',
      version: 1,
      mapping: JSON.stringify(correlationMapping1default),
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      profile: 'registration',
      hepid: 1,
      hep_alias: 'SIP',
      version: 1,
      mapping: JSON.stringify(correlationMapping1default),
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
