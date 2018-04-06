
exports.up = function(knex) {
  return knex
    .schema
    .createTable('users', function(usersTable) {
      // Primary Key
      usersTable.increments();
      // Data
      usersTable.string('name', 50).notNullable();
      usersTable.string('username', 50).notNullable().unique();
      usersTable.string('email', 250).notNullable().unique();
      usersTable.string('hash', 128).notNullable();
      usersTable.string('guid', 50).notNullable().unique();
      usersTable.timestamp('created_at').notNullable().defaultTo(knex.fn.now());            
    })
    .createTable('mapping_schema', function(mappingTable) {
      // Primary Key
      mappingTable.increments();
      // Data
      mappingTable.uuid('guid');
      mappingTable.string('profile', 100).notNullable().defaultTo('default');
      mappingTable.integer('hepid').notNullable();
      mappingTable.integer('gid').notNullable().defaultTo(10);
      mappingTable.string('profile', 100).notNullable().defaultTo('default');
      mappingTable.integer('version').notNullable();
      mappingTable.string('email', 250).notNullable().unique(); 
    })
    .createTable('birds', function(birdsTable) {
      // Primary Key
      birdsTable.increments();
      birdsTable.string('owner', 36).references('guid').inTable('users');
      // Data
      birdsTable.string('name', 250).notNullable();
      birdsTable.string('species', 250).notNullable();
      birdsTable.string('picture_url', 250).notNullable();
      birdsTable.string('guid', 36).notNullable().unique();
      birdsTable.boolean('isPublic').notNullable().defaultTo(true);
      birdsTable.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex
    .schema
    .dropTableIfExists( 'birds' )
    .dropTableIfExists( 'mapping_schema' )
    .dropTableIfExists( 'users' );
};
