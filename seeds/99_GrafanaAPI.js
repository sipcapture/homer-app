const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'global_settings';

  let empty = {};
  let grafURL = require('/tmp/grafana.json');
  if (grafURL){
	  const rows = [
	    {
	      id: 10,
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
	    .then(function() {
	      return knex.insert(rows).into(tableName);
	    });
   }
};
