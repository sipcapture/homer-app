
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
      mappingTable.string('hep_alias', 100);
      mappingTable.integer('gid').notNullable().defaultTo(10);
      mappingTable.integer('version').notNullable();
      mappingTable.integer('retention').notNullable().defaultTo(14);
      mappingTable.integer('partition_step').notNullable().defaultTo(3600);
      mappingTable.json('create_index');
      mappingTable.text('create_table');
      mappingTable.json('correlation_mapping');
      mappingTable.json('fields_mapping');
      mappingTable.json('mapping_settings');
      mappingTable.json('schema_mapping');
      mappingTable.json('schema_settings');
      mappingTable.timestamp('create_date').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('user_settings', function(userSettingsTable) {
      // Primary Key
      userSettingsTable.increments();
      // Data
      userSettingsTable.uuid('guid');      
      userSettingsTable.string('username', 100).notNullable();      
      userSettingsTable.integer('gid').notNullable();
      userSettingsTable.string('category', 100).notNullable().defaultTo('settings');
      userSettingsTable.timestamp('create_date').notNullable().defaultTo(knex.fn.now());
      userSettingsTable.string('param', 100).notNullable().defaultTo('default');
      userSettingsTable.json('data');
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
    .dropTableIfExists( 'user_settings' )
    .dropTableIfExists( 'users' );
};
