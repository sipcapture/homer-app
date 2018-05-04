import angular from 'angular';
import UserSettingsService from './user-settings.service';

export default angular.module('hepicApp.services.user-settings', [])
  .factory('UserSettingsService', /* @ngInject */ ($http, API, APP_PREF_SCHEMA) => new UserSettingsService($http, API, APP_PREF_SCHEMA));
