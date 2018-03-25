import angular from 'angular';
import Authentication from './authentication.service';

export default angular.module('hepicApp.login.authentication.service', [])
  .factory('AuthenticationService', /* @ngInject */ ($log, $rootScope, $state, $http, $localStorage, ROUTER, API
  ) => new Authentication($log, $rootScope, $state, $http, $localStorage, ROUTER, API));
