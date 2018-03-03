import angular from 'angular';
import SearchHelper from './search-helper.service';

export default angular.module('hepicApp.services.search-helper.service', []).factory('SearchHelper', /* @ngInject */ () => new SearchHelper());
