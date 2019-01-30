import angular from 'angular';
import MappingService from './mapping.service';

export default angular.module('hepicApp.services.mapping', [])
  .factory('MappingService', /* @ngInject */ ($http, API) => new MappingService($http, API));
