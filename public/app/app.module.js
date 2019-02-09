// npm modules
import 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'ace-builds/src-min-noconflict/ace';
import angular from 'angular';
import 'angular-ui-ace/src/ui-ace';
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
import 'angular-websocket';
import 'ng-fittext';
import 'angular-translate';
import 'angular-translate-loader-url';
import 'angular-file-upload/angular-file-upload';
import 'wavesurfer.js';
import 'angular-sweetalert/SweetAlert';
import 'ngstorage';
import 'angular-filter';
import 'font-awesome-webpack';
import 'angular-json-tree';
import 'ace-angular';
import 'angularjs-dropdown-multiselect';

// style
import 'font-awesome/css/font-awesome.css';
import 'nvd3/build/nv.d3.css';

// old homer modal. To-do: refactor this modal to component based structure
import './search/hepic-modal/homerCflow';
import './search/hepic-modal/homerModal';

// components
import Directives from './directives';
import Controllers from './controllers';
import Constants from './constants';
import Services from './services';
import Sections from './sections';
import Login from './login';
import Dashboards from './dashboards';
import Widgets from './widgets';
import Search from './search';
import Filters from './filters';
import Mock from './mock';

// register modules and components
const app = angular.module('hepicApp', [
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
  'angular-json-tree',
  'angularjs-dropdown-multiselect',
  Directives.name,
  Controllers.name,
  Constants.name,
  Services.name,
  Sections.name,
  Login.name,
  Dashboards.name,
  Search.name,
  Widgets.name,
  Filters.name,
  Mock.name,
]);

export default app;
