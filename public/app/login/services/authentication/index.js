import angular from 'angular';
import Authentication from './authentication.service';

export default angular.module('hepicApp.login.authentication.service', [])
  .factory('AuthenticationService', /* @ngInject */ ($rootScope, $state, $http, $localStorage, ROUTER) => new Authentication($rootScope, $state, $http, $localStorage, ROUTER));
