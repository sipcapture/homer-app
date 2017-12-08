import angular from 'angular';
import Authentication from './authentication.service';

export default angular.module('hepicApp.login.authentication.service', [])
  .factory(Authentication.name, [
    '$http',
    '$localStorage',
    function ($http, $localStorage) {
      return new Authentication($http, $localStorage);
    }
  ]);
