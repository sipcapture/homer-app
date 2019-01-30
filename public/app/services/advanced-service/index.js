import angular from 'angular';
import AdvancedService from './advanced.service';

export default angular.module('hepicApp.services.advanced', [])
  .factory('AdvancedService', /* @ngInject */ ($http, API) => new AdvancedService($http, API));
