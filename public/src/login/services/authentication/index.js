import angular from 'angular';
import Authentication from './authentication.service';

export default angular.module('hepicApp.login.authentication.service', [])
  .factory('AuthenticationService', /* @ngInject */ ($state, $http, $localStorage) => new Authentication($state, $http, $localStorage));
