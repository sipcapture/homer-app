import angular from 'angular';
import Authentication from './authentication.service';

export default angular.module('hepicApp.login.authentication.service', [])
  .factory(Authentication.name, [
    '$state',
    '$http',
    '$localStorage',
    function ($state, $http, $localStorage) {
      return new Authentication($state, $http, $localStorage);
    }
  ]);
