import angular from 'angular';
import Authentication from './authentication.service';

export default angular.module('hepicApp.login.authentication.service', [])
  .factory('AuthenticationService',
    /* @ngInject */ ($rootScope, $state, $http, $localStorage, ROUTER, API) => new Authentication($rootScope, $state, $http, $localStorage, ROUTER, API));
