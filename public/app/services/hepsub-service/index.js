import angular from 'angular';
import HepSubService from './hepsub.service';

export default angular.module('hepicApp.services.hepsub', [])
  .factory('HepSubService', /* @ngInject */ ($http, API) => new HepSubService($http, API));
