import 'jquery';
import angular from 'angular';
import '@uirouter/angularjs';
import 'angular-ui-bootstrap';
import 'angular-gridster';
import 'angular-ui-grid';
import 'angular-animate';
import 'angular-messages';
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

import 'bootstrap/dist/css/bootstrap.min.css';
import './style/app.css';

import Login from './login';
import Home from './home';

angular.module('hepicApp', [
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
  'ngMessages',
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
  Login.name,
  Home.name
])
  .config(config)
  .run(run);

function config($urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
}

function run($rootScope, $http, $location, $localStorage) {
  if ($localStorage.user) {
    $http.defaults.headers.common.Authorization = `Bearer ${$localStorage.user.token}`;
  }
	
  $rootScope.$on('$locationChangeStart', function() {
    var publicPages = ['/login'];
    var restrictedPage = publicPages.indexOf($location.path()) === -1;
    if (restrictedPage && !$localStorage.currentUser) {
      $location.path('/login');
    }
  });
}
