const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'user_settings';

  let empty = {};
  let dashboardHome= '{"alias":"home","config":{"columns":7,"draggable":{"handle":".box-header"},"margins":[10,10],"pushing":true,"resizable":{"enabled":true,"handles":["n","e","s","w","ne","se","sw","nw"]},"maxrows":5},"dashboardId":"home","id":"home","name":"HOME","selectedItem":"","title":"Home","weight":10,"widgets":[{"x":2,"y":0,"cols":5,"rows":3,"name":"result","title":"result","id":"result564","output":{}},{"x":0,"y":0,"cols":2,"rows":3,"name":"display-results","title":"display-results","id":"display-results579","output":{},"config":{"id":"display-results579","title":"CALL SIP SEARCH","group":"Search","name":"protosearch","description":"Display Search Form component","refresh":false,"sizeX":2,"sizeY":2,"config":{"title":"CALL SIP SEARCH","searchbutton":true,"protocol_id":{"name":"SIP","value":1},"protocol_profile":{"name":"default","value":"default"}},"uuid":"ed426bd0-ff21-40f7-8852-58700abc3762","fields":[{"field_name":"data_header.method","hepid":1,"name":"1:default:data_header.method","selection":"SIP Method","type":"string"},{"field_name":"data_header.callid","hepid":1,"name":"1:default:data_header.callid","selection":"SIP Callid","type":"string"},{"field_name":"limit","hepid":1,"name":"1:default:limit","selection":"Query Limit","type":"string"},{"field_name":"targetResultsContainer","hepid":1,"name":"1:default:targetResultsContainer","selection":"Results Container","type":"string"}],"row":0,"col":1,"cols":2,"rows":2,"x":0,"y":1,"protocol_id":{"name":"SIP","value":100}}}],"type":1}';
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
