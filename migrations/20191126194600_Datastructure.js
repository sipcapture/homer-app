
exports.up = function(knex) {
  return knex
    .schema
    .createTableIfNotExists('users', function(usersTable) {
      // Primary Key
      usersTable.increments();
      // Data
      usersTable.string('username', 50).notNullable().unique();
      usersTable.integer('partid').notNullable().defaultTo(10);
      usersTable.string('email', 250).notNullable();
      usersTable.string('firstname', 50).notNullable();
      usersTable.string('lastname', 50).notNullable();
      usersTable.string('department', 50).notNullable().defaultTo('NOC');
      usersTable.string('usergroup', 250).notNullable();
      usersTable.string('hash', 128).notNullable();
      usersTable.string('guid', 50).notNullable().unique();
      usersTable.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    })
    .createTableIfNotExists('mapping_schema', function(mappingTable) {
      // Primary Key
      mappingTable.increments();
      // Data
      mappingTable.uuid('guid');
      mappingTable.string('profile', 100).notNullable().defaultTo('default');
      mappingTable.integer('hepid').notNullable();
      mappingTable.string('hep_alias', 100);
      mappingTable.integer('partid').notNullable().defaultTo(10);
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
    .createTableIfNotExists('hepsub_mapping_schema', function(hepSubMappingTable) {
      // Primary Key
      hepSubMappingTable.increments();
      // Data
      hepSubMappingTable.uuid('guid');
      hepSubMappingTable.string('profile', 100).notNullable().defaultTo('default');
      hepSubMappingTable.integer('hepid').notNullable();
      hepSubMappingTable.string('hep_alias', 100);
      hepSubMappingTable.integer('version').notNullable();
      hepSubMappingTable.json('mapping');
      hepSubMappingTable.timestamp('create_date').notNullable().defaultTo(knex.fn.now());
    })
    .createTableIfNotExists('user_settings', function(userSettingsTable) {
      // Primary Key
      userSettingsTable.increments();
      // Data
      userSettingsTable.uuid('guid');
      userSettingsTable.string('username', 100).notNullable();
      userSettingsTable.integer('partid').notNullable();
      userSettingsTable.string('category', 100).notNullable().defaultTo('settings');
      userSettingsTable.timestamp('create_date').notNullable().defaultTo(knex.fn.now());
      userSettingsTable.string('param', 100).notNullable().defaultTo('default');
      userSettingsTable.json('data');
    })
    .createTableIfNotExists('global_settings', function(globalSettingsTable) {
      // Primary Key
      globalSettingsTable.increments();
      // Data
      globalSettingsTable.uuid('guid');
      globalSettingsTable.integer('partid').notNullable();
      globalSettingsTable.string('category', 100).notNullable().defaultTo('settings');
      globalSettingsTable.timestamp('create_date').notNullable().defaultTo(knex.fn.now());
      globalSettingsTable.string('param', 100).notNullable().defaultTo('default');
      globalSettingsTable.json('data');
    })
    .createTableIfNotExists('agent_location_session', function(agentLocationSession) {
      // Primary Key
      agentLocationSession.increments();
      // Data
      agentLocationSession.uuid('guid');
      agentLocationSession.integer('gid').notNullable();
      agentLocationSession.string('host', 250).notNullable().defaultTo('127.0.0.1');
      agentLocationSession.integer('port').notNullable().defaultTo(8080);
      agentLocationSession.string('protocol', 50).notNullable().defaultTo('log');
      agentLocationSession.string('path', 250).notNullable().defaultTo('/api/search');
      agentLocationSession.string('node', 100).notNullable().defaultTo('testnode');
      agentLocationSession.string('type', 200).notNullable().defaultTo('type');      
      agentLocationSession.timestamp('create_date').notNullable().defaultTo(knex.fn.now());
      agentLocationSession.timestamp('expire_date').notNullable().defaultTo('2032-12-31 00:00:00');
      agentLocationSession.integer('active').notNullable().defaultTo(1);
    })
    .createTableIfNotExists('alias', function(aliasTable) {
      // Primary Key
      aliasTable.increments();
      // Data
      aliasTable.uuid('guid');
      aliasTable.string('alias', 40);
      aliasTable.string('ip', 60);
      aliasTable.integer('port');
      aliasTable.integer('mask');
      aliasTable.string('captureID', 20);
      aliasTable.boolean('status');
      aliasTable.timestamp('create_date').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex
    .schema
    .dropTableIfExists( 'mapping_schema' )
    .dropTableIfExists( 'hepsub_mapping_schema' )
    .dropTableIfExists( 'user_settings' )
    .dropTableIfExists( 'global_settings' )
    .dropTableIfExists( 'agent_location_session' )
    .dropTableIfExists( 'alias' )
    .dropTableIfExists( 'users' );
};
