const uuidv4 = require('uuid/v4');

exports.seed = function seed(knex) {
  const tableName = 'user_settings';

  let empty = {};
  let dashboardHome='{"id":"home","name":"Home","alias":"home","selectedItem":"","title":"Home","weight":10.0,"widgets":[{"reload":false,"frameless":false,"title":"World Clock","group":"Tools","name":"clock","description":"Display date and time","templateUrl":"widgets/clock/view.html","controller":"clockController","controllerAs":"clock","sizeX":1.0,"sizeY":1.0,"config":{"title":"World Clock","timePattern":"HH:mm:ss","datePattern":"YYYY-MM-DD","location":{"value":-60.0,"offset":"+1","name":"GMT+1 CET","desc":"Central European Time"},"showseconds":false},"edit":{"reload":true,"immediate":false,"controller":"clockEditController","templateUrl":"widgets/clock/edit.html"},"row":0.0,"col":0.0,"api":{},"uuid":"0131d42a-793d-47d6-ad03-7cdc6811fb56"},{"reload":false,"frameless":false,"title":"Sipcapture Stats","group":"Charts","name":"sipcapture","description":"Displaycharts time","templateUrl":"widgets/sipcapture/sipcapture.html","controller":"sipcaptureController","controllerAs":"sipcapture","refresh":true,"sizeX":3.0,"sizeY":1.0,"config":{"title":"Sipcapture Stats","dataquery":{"data":[{"main":{"name":"Calls","value":"calls"},"type":[{"name":"unauth","value":"unauth"},{"name":"finished","value":"finished"},{"name":"canceled","value":"canceled"}]}]},"panel":{"queries":[{"name":"A1","type":{"name":"Sipcapture","alias":"sipcapture"},"value":"query"}],"total":false},"chart":{"size":{"height":250.0},"library":{"id":3.0,"label":"D3JS","value":"d3"},"type":{"id":3.0,"label":"Area spline","value":"areaspline"}},"debugresp":""},"edit":{"reload":true,"immediate":false,"controller":"sipcaptureEditController","templateUrl":"widgets/sipcapture/edit.html"},"api":{},"row":4.0,"col":2.0,"uuid":"ec61725e-34ce-4916-8224-f91576f67c9b"},{"reload":false,"frameless":false,"title":"Sipcapture Stats","group":"Charts","name":"sipcapture","description":"Displaycharts time","templateUrl":"widgets/sipcapture/sipcapture.html","controller":"sipcaptureController","controllerAs":"sipcapture","refresh":true,"sizeX":5.0,"sizeY":1.0,"config":{"title":"HEP Packets","dataquery":{"data":[{"main":{"name":"Proto","value":"proto"},"type":[{"name":"hepall","value":"hepall"}],"tag":[]}]},"panel":{"queries":[{"name":"A1","type":{"name":"Sipcapture","alias":"sipcapture"},"value":"query"}],"total":false},"chart":{"size":{"height":250.0},"library":{"id":3.0,"label":"D3JS","value":"d3"},"type":{"id":3.0,"label":"Area spline","value":"areaspline"}},"debugresp":""},"edit":{"reload":true,"immediate":false,"controller":"sipcaptureEditController","templateUrl":"widgets/sipcapture/edit.html"},"api":{},"row":5.0,"col":0.0,"uuid":"119dc220-a274-4a21-a042-afc7a4967934"},{"reload":false,"frameless":false,"title":"Sipcapture Stats","group":"Charts","name":"sipcapture","description":"Displaycharts time","templateUrl":"widgets/sipcapture/sipcapture.html","controller":"sipcaptureController","controllerAs":"sipcapture","refresh":true,"sizeX":1.0,"sizeY":1.0,"config":{"title":"Sipcapture Stats","chart":{"size":{"height":250.0},"library":{"id":3.0,"label":"D3JS","value":"d3"},"type":{"id":6.0,"label":"Pie","value":"pie"},"legend":{"enabled":true}},"dataquery":{"data":[{"sum":true,"main":{"name":"Calls","value":"calls"},"type":[{"name":"finished","value":"finished"},{"name":"canceled","value":"canceled"},{"name":"unauth","value":"unauth"},{"name":"busy","value":"busy"},{"name":"user_failure","value":"user_failure"}]}]},"panel":{"queries":[{"name":"A1","type":{"name":"Sipcapture","alias":"sipcapture"},"value":"query"}],"total":true},"debugresp":""},"edit":{"reload":true,"immediate":false,"controller":"sipcaptureEditController","templateUrl":"widgets/sipcapture/edit.html"},"api":{},"row":4.0,"col":0.0,"uuid":"370d706c-8b3a-4119-b675-2f158b111c03"},{"title":"InfluxDB Chart","group":"Charts","name":"influxdbchart","description":"Display SIP Metrics","refresh":true,"sizeX":3.0,"sizeY":1.0,"config":{"title":"HEPIC Chart","chart":{"type":{"value":"line"}},"dataquery":{"data":[{"sum":false,"main":{"name":"hepic_statistics_all","value":"hepic_statistics_all"},"database":{"name":"hepic"},"retention":{},"type":[{"name":"calls_pps","value":"calls_pps"},{"name":"total_pps","value":"total_pps"}],"tag":[]}]},"panel":{"queries":[{"name":"A1","type":{"name":"InfluxDB","alias":"influxdb"},"database":{"name":"hepic"},"retention":{},"value":"query"}]}},"edit":{},"api":{},"uuid":"e2bda1f1-b390-4193-8088-c059913780cd","row":2.0,"col":0.0},{"title":"InfluxDB Chart","group":"Charts","name":"influxdbchart","description":"Display SIP Metrics","refresh":true,"sizeX":3.0,"sizeY":1.0,"config":{"title":"HEPIC Chart","chart":{"type":{"value":"line"}},"dataquery":{"data":[{"sum":false,"main":{"name":"cpu","value":"cpu"},"database":{"name":"telegraf"},"retention":{"name":"autogen"},"type":[{"name":"usage_user","value":"usage_user"}],"tag":[]}]},"panel":{"queries":[{"name":"A1","type":{"name":"InfluxDB","alias":"influxdb"},"database":{"name":"telegraf"},"retention":{"name":"autogen"},"value":"query"}]},"format":{"id":1.0,"label":"Default","value":"raw"}},"edit":{},"api":{},"uuid":"2e74f74b-f19b-4836-8c21-4fab1683c1cb","row":1.0,"col":0.0},{"title":"Proto Search","group":"Search","name":"protosearch","description":"Display Search Form component","refresh":false,"sizeX":2.0,"sizeY":1.0,"config":{"title":"CALL SIP SEARCH","searchbutton":true,"protocol_id":{"name":"SIP","value":1.0},"protocol_profile":{"name":"default","value":"default"}},"uuid":"ed426bd0-ff21-40f7-8852-58700abc3762","fields":[{"name":"1:default:sid","selection":"Session ID","form_type":"input","hepid":1.0,"profile":"default","type":"string","field_name":"sid"},{"name":"1:default:protocol_header.srcIp","selection":"Source IP","form_type":"input","hepid":1.0,"profile":"default","type":"string","field_name":"protocol_header.srcIp"},{"name":"1:default:protocol_header.srcPort","selection":"Src Port","form_type":"input","hepid":1.0,"profile":"default","type":"integer","field_name":"protocol_header.srcPort"},{"name":"1:default:raw","selection":"SIP RAW","form_type":"input","hepid":1.0,"profile":"default","type":"string","field_name":"raw"}],"row":0.0,"col":1.0},{"title":"Proto Search","group":"Search","name":"protosearch","description":"Display Search Form component","refresh":false,"sizeX":3.0,"sizeY":1.0,"config":{"title":"JANUS SEARCH","searchbutton":true,"protocol_id":{"name":"JANUS","value":1000.0},"protocol_profile":{"name":"default","value":"default"}},"uuid":"1d06f12e-8eb0-4f0b-b913-6f0731f26cd1","fields":[{"name":"1000:default:sid","selection":"Session ID","form_type":"input","hepid":1000.0,"profile":"default","type":"string","field_name":"sid"},{"name":"1000:default:protocol_header.address","selection":"Proto Address","form_type":"input","hepid":1000.0,"profile":"default","type":"string","field_name":"protocol_header.address"},{"name":"1000:default:data_header.handle","selection":"Data Handle","form_type":"input","hepid":1000.0,"profile":"default","type":"integer","field_name":"data_header.handle"},{"name":"1000:default:data_header.source","selection":"Data Source","form_type":"input","hepid":1000.0,"profile":"default","type":"string","field_name":"data_header.source"},{"name":"1000:default:data_header.medium","selection":"Data Medium","form_type":"input","hepid":1000.0,"profile":"default","type":"string","field_name":"data_header.medium"},{"name":"1000:default:protocol_header.port","selection":"Protocol port","form_type":"input","hepid":1000.0,"profile":"default","type":"integer","field_name":"protocol_header.port"}],"row":3.0,"col":0.0},{"title":"InfluxDB Chart","group":"Charts","name":"influxdbchart","description":"Display SIP Metrics","refresh":true,"sizeX":2.0,"sizeY":1.0,"config":{"title":"HEPIC Chart","chart":{"type":{"value":"line"}},"dataquery":{"data":[{"sum":false,"main":{"name":"method","value":"method"},"database":{"name":"hep"},"retention":{"name":"autogen"},"type":[{"name":"ACK","value":"ACK"},{"name":"BYE:100","value":"BYE:100"},{"name":"INVITE:100","value":"INVITE:100"},{"name":"INVITE","value":"INVITE"},{"name":"BYE","value":"BYE"},{"name":"BYE:200","value":"BYE:200"},{"name":"INVITE:101","value":"INVITE:101"},{"name":"INVITE:200","value":"INVITE:200"},{"name":"INVITE:407","value":"INVITE:407"}],"tag":[]}]},"panel":{"queries":[{"name":"A1","type":{"name":"InfluxDB","alias":"influxdb"},"database":{"name":"hep"},"retention":{"name":"autogen"},"value":"query"}]}},"edit":{},"api":{},"uuid":"5f3cffbd-1fda-47fd-9817-5f72ce420f53","row":0.0,"col":3.0}],"config":{"margins":[10.0,10.0],"columns":"6","pushing":true,"draggable":{"handle":".box-header"},"resizable":{"enabled":true,"handles":["n","e","s","w","ne","se","sw","nw"]}}}';
  let dashboardSearch='{"id":"search","name":"Search","alias":"search","selectedItem":"","title":"Search","weight":10.0,"widgets":[{"reload":false,"frameless":false,"title":"World Clock","group":"Tools","name":"clock","description":"Display date and time","templateUrl":"widgets/clock/view.html","controller":"clockController","controllerAs":"clock","sizeX":1.0,"sizeY":1.0,"config":{"title":"World Clock","timePattern":"HH:mm:ss","datePattern":"YYYY-MM-DD","location":{"value":-60.0,"offset":"+1","name":"GMT+1 CET","desc":"Central European Time"},"showseconds":false},"edit":{"reload":true,"immediate":false,"controller":"clockEditController","templateUrl":"widgets/clock/edit.html"},"row":0.0,"col":0.0,"api":{},"$$hashKey":"object:2435"},{"reload":false,"frameless":false,"title":"Search Form Builder","group":"Search","name":"quicksearch","description":"Display Search Form component","templateUrl":"widgets/quicksearch/quicksearch.html","controller":"quickSearchController","controllerAs":"qsearch","sizeX":2.0,"sizeY":1.0,"config":{"title":"QuickSearch","fields":[{"name":"from_user","selection":"From","$$hashKey":"object:2488"},{"name":"to_user","selection":"To","$$hashKey":"object:2489"},{"name":"callid","selection":"Call-ID","$$hashKey":"object:2490"}],"searchbutton":true},"edit":{"reload":true,"immediate":false,"controller":"quickSearchEditController","templateUrl":"widgets/quicksearch/edit.html"},"row":0.0,"col":1.0,"api":{},"$$hashKey":"object:2436"},{"reload":false,"frameless":false,"title":"Sipcapture Stats","group":"Charts","name":"sipcapture","description":"Displaycharts time","templateUrl":"widgets/sipcapture/sipcapture.html","controller":"sipcaptureController","controllerAs":"sipcapture","refresh":true,"sizeX":3.0,"sizeY":1.0,"config":{"title":"Sipcapture Stats","dataquery":{"data":[{"main":{"name":"Calls","value":"calls"},"type":[{"name":"unauth","value":"unauth"},{"name":"finished","value":"finished"},{"name":"canceled","value":"canceled"}]}]},"panel":{"queries":[{"name":"A1","type":{"name":"Sipcapture","alias":"sipcapture"},"value":"query"}],"total":false},"chart":{"size":{"height":250.0},"library":{"id":3.0,"label":"D3JS","value":"d3"},"type":{"id":3.0,"label":"Area spline","value":"areaspline"}},"debugresp":""},"edit":{"reload":true,"immediate":false,"controller":"sipcaptureEditController","templateUrl":"widgets/sipcapture/edit.html"},"api":{},"row":0.0,"col":3.0,"$$hashKey":"object:2437"},{"reload":false,"frameless":false,"title":"Sipcapture Stats","group":"Charts","name":"sipcapture","description":"Displaycharts time","templateUrl":"widgets/sipcapture/sipcapture.html","controller":"sipcaptureController","controllerAs":"sipcapture","refresh":true,"sizeX":5.0,"sizeY":1.0,"config":{"title":"HEP Packets","dataquery":{"data":[{"main":{"name":"Proto","value":"proto"},"type":[{"name":"hepall","value":"hepall","$$hashKey":"object:3065"}],"tag":[]}]},"panel":{"queries":[{"name":"A1","type":{"name":"Sipcapture","alias":"sipcapture"},"value":"query","$$hashKey":"object:2939"}],"total":false},"chart":{"size":{"height":250.0},"library":{"id":3.0,"label":"D3JS","value":"d3"},"type":{"id":3.0,"label":"Area spline","value":"areaspline"}},"debugresp":""},"edit":{"reload":true,"immediate":false,"controller":"sipcaptureEditController","templateUrl":"widgets/sipcapture/edit.html"},"api":{},"row":1.0,"col":1.0,"$$hashKey":"object:2438"},{"reload":false,"frameless":false,"title":"Sipcapture Stats","group":"Charts","name":"sipcapture","description":"Displaycharts time","templateUrl":"widgets/sipcapture/sipcapture.html","controller":"sipcaptureController","controllerAs":"sipcapture","refresh":true,"sizeX":1.0,"sizeY":1.0,"config":{"title":"Sipcapture Stats","chart":{"size":{"height":250.0},"library":{"id":3.0,"label":"D3JS","value":"d3"},"type":{"id":6.0,"label":"Pie","value":"pie"},"legend":{"enabled":true}},"dataquery":{"data":[{"sum":true,"main":{"name":"Calls","value":"calls"},"type":[{"name":"finished","value":"finished"},{"name":"canceled","value":"canceled"},{"name":"unauth","value":"unauth"},{"name":"busy","value":"busy"},{"name":"user_failure","value":"user_failure"}]}]},"panel":{"queries":[{"name":"A1","type":{"name":"Sipcapture","alias":"sipcapture"},"value":"query"}],"total":true},"debugresp":""},"edit":{"reload":true,"immediate":false,"controller":"sipcaptureEditController","templateUrl":"widgets/sipcapture/edit.html"},"api":{},"row":1.0,"col":0.0,"$$hashKey":"object:2439"}],"config":{"margins":[10.0,10.0],"columns":"6","pushing":true,"draggable":{"handle":".box-header"},"resizable":{"enabled":true,"handles":["n","e","s","w","ne","se","sw","nw"]}}}';
  
  const rows = [
    {
      guid: uuidv4(),
      username: 'trex',            
      param: 'home',
      gid: 10,
      category: 'dashboard',
      //data: JSON.stringify(empty),
      data: dashboardHome,
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      username: 'trex',            
      param: 'search',
      gid: 10,
      category: 'dashboard',
      //data: JSON.stringify(empty),
      data: dashboardSearch,
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      username: 'shurik',            
      param: 'home',
      gid: 10,
      category: 'dashboard',
      //data: JSON.stringify(empty),
      data: dashboardHome,
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      username: 'shurik',            
      param: 'search',
      gid: 10,
      category: 'dashboard',
      //data: JSON.stringify(empty),
      data: dashboardSearch,
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      username: 'lorenzo',            
      param: 'home',
      gid: 10,
      category: 'dashboard',
      //data: JSON.stringify(empty),
      data: dashboardHome,
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      username: 'lorenzo',            
      param: 'search',
      gid: 10,
      category: 'dashboard',
      //data: JSON.stringify(empty),
      data: dashboardSearch,
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      username: 'negbie',            
      param: 'home',
      gid: 10,
      category: 'dashboard',
      //data: JSON.stringify(empty),
      data: dashboardHome,
      create_date: new Date(),
    },
    {
      guid: uuidv4(),
      username: 'negbie',            
      param: 'search',
      gid: 10,
      category: 'dashboard',
      //data: JSON.stringify(empty),
      data: dashboardSearch,
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
