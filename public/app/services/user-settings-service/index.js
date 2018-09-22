import angular from 'angular';
import UserSettingsService from './user-settings.service';

export default angular.module('hepicApp.services.user-settings', [])
  .factory('UserSettingsService', /* @ngInject */ ($http, API) => new UserSettingsService($http, API));
