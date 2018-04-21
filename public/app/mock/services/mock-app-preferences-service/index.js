import angular from 'angular';
import MockAppPreferencesService from './mock-app-preferences.service';

export default angular.module('hepicApp.mock.services.mock-app-preferences.service', [])
  .factory('mockAppPreferencesService', /* @ngInject */ () => new MockAppPreferencesService());
