// npm modules
import 'jquery';
import angular from 'angular';
import '@uirouter/angularjs';
import 'angular-ui-bootstrap';
import 'angular-aria';
import 'angular-animate';
import 'angular-gridster';
import 'angular-ui-grid';
import 'angular-cookies';
import 'angular-sanitize';
import 'ui-select';
import 'angular-dialog-service';
import 'angular-local-storage';
import 'angular-smart-table';
import 'angular-nvd3';
import 'ui-leaflet';
import 'angular-simple-logger';
import 'angular-ui-ace';
import 'angular-websocket';
import 'ng-fittext';
import 'angular-translate';
import 'angular-translate-loader-url';
import 'angular-visjs';
import 'angular-file-upload/angular-file-upload';
import 'wavesurfer.js';
import 'angular-sweetalert/SweetAlert';
import 'ngstorage';

// components
import Constants from './constants';
import Services from './services';
import Sections from './sections';
import Login from './login';
import Dashboards from './dashboards';
import Widgets from './widgets';
import Search from './search';

// controllers
import HepicController from './controllers/hepic.controller';

// register modules
var app = angular.module('hepicApp', [
  'ui.router',
  'ui.bootstrap',
  'gridster',
  'ui.grid',
  'ui.grid.resizeColumns',
  'ui.grid.autoResize',
  'ui.grid.pagination',
  'ui.grid.selection',
  'ui.grid.saveState',
  'ui.grid.cellNav',
  'ui.grid.moveColumns',
  'ui.grid.pinning',
  'ui.grid.grouping',
  'ui.grid.exporter',
  'oitozero.ngSweetAlert',
  'ngAnimate',
  'ngAria',
  'ngCookies',
  'ui.select',
  'ngSanitize',
  'ngStorage',
  'dialogs.main',
  'LocalStorageModule',
  'smart-table',
  'nvd3',
  'nemLogging',
  'ui-leaflet',
  'ui.ace',
  'ngWebSocket',
  'ngFitText',
  'pascalprecht.translate',
  'ngVis',
  'angularFileUpload',
  'ds.clock',
  Constants.name,
  Services.name,
  Sections.name,
  Login.name,
  Dashboards.name,
  Search.name,
  Widgets.name
]).controller('hepicController', HepicController);

export default app;
