const CONFIGURATION = {
  APP_NAME: '.hepic',
  DEBUG: true,
  USER_EXT_CR: false,
  WEBSOCKET: false,
  HEPIC_VERSION: '2.1.11',
  VERSION: '6.1.1',
  APIURL: 'api/v3/',
  DASHBOARD_DEFAULT: {
    margins: [10, 10],
    columns: 5,
    pushing: true,
    draggable: {
      handle: '.box-header',
    },
    resizable: {
      enabled: true,
      handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
      resize: function(event, $element, widget) {
        if (widget.api && widget.api.resizeUpdate) widget.api.resizeUpdate();
      },
      stop: function(event, $element, widget) {
        setTimeout(function() {
          if (widget.api && widget.api.resizeUpdate) widget.api.resizeUpdate();
        }, 400);
      },
    },
  },
  FOOTER: {
    URL: 'https://www.sipcapture.org',
  },
};

CONFIGURATION.TITLE = 'HEPIC ' + CONFIGURATION.HEPIC_VERSION;

export default CONFIGURATION;
