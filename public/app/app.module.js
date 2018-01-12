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
import 'd3';
import 'nvd3';
import 'angular-nvd3';
import 'vis';
import 'angular-visjs';
import 'ui-select';
import 'angular-dialog-service';
import 'angular-local-storage';
import 'angular-smart-table';
import 'leaflet';
import 'ui-leaflet';
import 'angular-simple-logger';
import 'angular-ui-ace';
import 'angular-websocket';
import 'ng-fittext';
import 'angular-translate';
import 'angular-translate-loader-url';
import 'angular-file-upload/angular-file-upload';
import 'wavesurfer.js';
import 'angular-sweetalert/SweetAlert';
import 'ngstorage';
import 'angular-filter';

// old homer modal. To-do: refactor this modal to component based structure
import './search/modal/homerCflow';
import './search/modal/homerModal';

// components
import Controllers from './controllers';
import Constants from './constants';
import Services from './services';
import Sections from './sections';
import Login from './login';
import Dashboards from './dashboards';
import Widgets from './widgets';
import Search from './search';

// register modules and components
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
  'ui.ace',
  'ui.select',
  'angular.filter',
  'oitozero.ngSweetAlert',
  'ngAnimate',
  'ngAria',
  'ngCookies',
  'ngSanitize',
  'ngStorage',
  'dialogs.main',
  'LocalStorageModule',
  'smart-table',
  'nvd3',
  'nemLogging',
  'ui-leaflet',
  'ngWebSocket',
  'ngFitText',
  'pascalprecht.translate',
  'ngVis',
  'angularFileUpload',
  'ds.clock',
  'homer.modal', // to-do: delete this modules when the homer modal refactored
  'homer.cflow',
  Controllers.name,
  Constants.name,
  Services.name,
  Sections.name,
  Login.name,
  Dashboards.name,
  Search.name,
  Widgets.name
]);

export default app;
