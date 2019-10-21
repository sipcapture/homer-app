const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'user_settings';

  let empty = {};
  let dashboardHome= '{"alias":"home","config":{"columns":7,"draggable":{"handle":".box-header"},"margins":[10,10],"pushing":true,"resizable":{"enabled":true,"handles":["n","e","s","w","ne","se","sw","nw"]},"maxrows":5},"dashboardId":"home","id":"home","name":"HOME","selectedItem":"","title":"Home","weight":10,"widgets":[{"x":0,"y":0,"cols":1,"rows":3,"name":"protosearch","title":"CALL SIP SEARCH","sizeX":1,"sizeY":3,"col":0,"row":0,"config":{"title":"CALL SIP SEARCH","group":"Search","name":"protosearch","description":"Display Search Form component","refresh":false,"sizeX":2,"sizeY":2,"config":{"title":"CALL SIP SEARCH","searchbutton":true,"protocol_id":{"name":"SIP","value":1},"protocol_profile":{"name":"call","value":"call"}},"uuid":"ed426bd0-ff21-40f7-8852-58700abc3762","fields":[{"field_name":"protocol_header.srcIp","hepid":1,"name":"1:call:protocol_header.srcIp","selection":"Source IP","type":"string","value":""},{"field_name":"sid","hepid":1,"name":"1:call:sid","selection":"Session ID","type":"string","value":""},{"field_name":"protocol_header.protocol","hepid":1,"name":"1:call:protocol_header.protocol","selection":"Protocol Type","type":"string","value":""}],"row":0,"col":1,"cols":2,"rows":2,"x":0,"y":1,"protocol_id":{"name":"SIP","value":100}},"id":"protosearch0"},{"x":1,"y":0,"cols":4,"rows":3,"name":"influxdbchart","title":"HEP Stats","sizeX":4,"sizeY":3,"col":1,"row":0,"config":{"title":"HEP Stats","chart":{"type":{"value":"line"}},"format":{"value":"row"},"dataquery":{"data":[{"sum":false,"main":{"name":"heplify_packets_total","value":"heplify_packets_total"},"database":{"name":"homer"},"retention":{"name":"60s"},"type":[{"name":"counter","value":"counter"}],"tag":[],"rawpath":[],"rawquery":[]}]},"panel":{"queries":[{"name":"A1","type":{"name":"influxDB","alias":"influxDB"},"database":{"name":"homer"},"retention":{"name":"60s"},"value":"query"}]}},"id":"influxdbchart1"}],"type":1}';
  const rows = [
    {
      guid: uuidv4(),
      username: 'admin',
      param: 'home',
      partid: 10,
      category: 'dashboard',
      data: dashboardHome,
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      username: 'support',
      param: 'home',
      partid: 10,
      category: 'dashboard',
      data: dashboardHome,
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
