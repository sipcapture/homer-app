import angular from 'angular';
import AliasService from './alias.service';

export default angular.module('hepicApp.services.alias', [])
  .factory('AliasService', /* @ngInject */ ($http, API) => new AliasService($http, API));
