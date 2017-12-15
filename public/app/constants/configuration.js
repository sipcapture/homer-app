const CONFIGURATION = {
  DEBUG: true,
  USER_EXT_CR: false,
  WEBSOCKET: false,
  HEPIC_VERSION: '2.1.11',
  VERSION: '6.1.1',
  APIURL: 'api/v2/',
  DASHBOARD_DEFAULT: {
    margins: [10, 10],
    columns: 5,
    pushing: true,
    draggable: {
      handle: '.box-header'
    }
  }
};

CONFIGURATION.TITLE = 'HEPIC ' + CONFIGURATION.HEPIC_VERSION;

export default CONFIGURATION;
