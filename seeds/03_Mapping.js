const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'mapping_schema';

  let empty = {};

  let fieldsMapping1default = [
    {
      id: 'cid',
      type: 'string',
      index: 'secondary',
      name: 'Correlation ID',
      form_type: 'input',
    },
    {
      id: 'protocol_header.protocolFamily',
      name: 'Proto Family',
      type: 'integer',
      index: 'none',
      form_type: 'input',
    },
    {
      id: 'protocol_header.protocol',
      name: 'Protocol Type',
      type: 'integer',
      index: 'none',
      form_type: 'input',
    },
    {
      id: 'protocol_header.srcIp',
      name: 'Source IP',
      type: 'string',
      index: 'none',
      form_type: 'input',
    },
    {
      id: 'protocol_header.dstIp',
      name: 'Destination IP',
      type: 'string',
      index: 'none',
      form_type: 'input',
    },
    {
      id: 'data_header.method',
      name: 'Method',
      type: 'string',
      index: 'none',
      form_type: 'select',
      form_default: ['INVITE','BYE','100','200','183','CANCEL'],
    },
    {
      id: 'data_header.callid',
      name: 'SIP Callid',
      type: 'string',
      index: 'none',
      form_type: 'input',
    },
    {
      id: 'raw',
      name: 'RAW',
      type: 'string',
      index: 'none',
      form_type: 'input',
    },  
  ];
  
  let fieldsMapping100default = [
    {
      id: 'cid',
      type: 'string',
      index: 'secondary',
      name: 'Correlation ID',
      form_type: 'input',
    },
    {
      id: 'protocol_header.protocolFamily',
      name: 'Proto Family',
      type: 'integer',
      index: 'none',
      form_type: 'input',
    },
    {
      id: 'protocol_header.protocol',
      name: 'Protocol Type',
      type: 'integer',
      index: 'none',
      form_type: 'input',
    },
    {
      id: 'protocol_header.srcIp',
      name: 'Source IP',
      type: 'string',
      index: 'none',
      form_type: 'input',
    },
    {
      id: 'protocol_header.dstIp',
      name: 'Destination IP',
      type: 'string',
      index: 'none',
      form_type: 'input',
    },
    {
      id: 'data_header.method',
      name: 'Method',
      type: 'string',
      index: 'none',
      form_type: 'select',
      form_default: ['INVITE','BYE','100','200','183','CANCEL'],
    },
    {
      id: 'data_header.callid',
      name: 'SIP Callid',
      type: 'string',
      index: 'none',
      form_type: 'input',
    },
    {
      id: 'raw',
      name: 'RAW',
      type: 'string',
      index: 'none',
      form_type: 'input',
    },  
  ];
  
  let correlationMapping1default = [
    {
      source_field: 'data_header.callid',
      lookup_id: 100,
      lookup_profile: 'default',
      lookup_field: 'cid',
      lookup_range: [-300,200],
    }
  ];
    
  let correlationMapping100default = [
    {
      source_field: 'cid',
      lookup_id: 1,
      lookup_profile: 'call',
      lookup_field: 'data_header.callid',
      lookup_range: [-300,200],
    },
    {
      source_field: 'cid',
      lookup_id: 1,
      lookup_profile: 'registration',
      lookup_field: 'data_header.callid',
      lookup_range: [-300,200],
    },
    {
      source_field: 'cid',
      lookup_id: 1,
      lookup_profile: 'default',
      lookup_field: 'data_header.callid',
      lookup_range: [-300,200],
    }
  ];
            
  const rows = [
    {
      guid: uuidv4(),
      profile: 'default',
      hepid: 1,
      hep_alias: 'SIP',
      gid: 10,
      version: 1,
      retention: 10,
      partition_step: 10,
      create_index: JSON.stringify(empty),
      create_table: 'CREATE TABLE test(id integer, data text);',
      fields_mapping: JSON.stringify(fieldsMapping1default),
      correlation_mapping: JSON.stringify(correlationMapping1default),
      schema_mapping: JSON.stringify(empty),
      schema_settings: JSON.stringify(empty),
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      profile: 'call',
      hepid: 1,
      hep_alias: 'SIP',
      gid: 10,
      version: 1,
      retention: 10,
      partition_step: 10,
      create_index: JSON.stringify(empty),
      create_table: 'CREATE TABLE test(id integer, data text);',
      fields_mapping: JSON.stringify(fieldsMapping1default),
      correlation_mapping: JSON.stringify(correlationMapping1default),
      schema_mapping: JSON.stringify(empty),
      schema_settings: JSON.stringify(empty),
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      profile: 'registration',
      hepid: 1,
      hep_alias: 'SIP',
      gid: 10,
      version: 1,
      retention: 10,
      partition_step: 10,
      create_index: JSON.stringify(empty),
      create_table: 'CREATE TABLE test(id integer, data text);',
      fields_mapping: JSON.stringify(fieldsMapping1default),
      correlation_mapping: JSON.stringify(correlationMapping1default),
      schema_mapping: JSON.stringify(empty),
      schema_settings: JSON.stringify(empty),
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      profile: 'default',
      hepid: 100,
      hep_alias: 'LOG',
      gid: 10,
      version: 1,
      retention: 10,
      partition_step: 10,
      create_index: JSON.stringify(empty),
      create_table: 'CREATE TABLE test(id integer, data text);',
      fields_mapping: JSON.stringify(fieldsMapping100default),
      correlation_mapping: JSON.stringify(correlationMapping100default),
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
