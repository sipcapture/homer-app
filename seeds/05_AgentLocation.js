const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'agent_location_session';

  let empty = {};
  
  const rows = [
    {
      guid: uuidv4(),
      gid: 10,
      host: '127.0.0.1',
      port: 8080,
      protocol: 'rtp',
      path: '/api/search',
      node: 'rtpnode01',
      type: 'cdr',
      create_date: new Date(),
      expire_date: new Date('December 31, 2032 00:00:00'),
      active: 1,
    },
  ];

  return knex(tableName)
    // Empty the table (DELETE)
    .del()
    .then(function() {
      return knex.insert(rows).into(tableName);
    });
};
