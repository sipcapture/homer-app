import angular from 'angular';
import UserService from './user.service';

export default angular.module('hepicApp.services.user', [])
  .factory('UserService', /* @ngInject */ ($http, API, APP_PREF_SCHEMA) => new UserService($http, API, APP_PREF_SCHEMA));
