import angular from 'angular';
import Search from './search';
import SearchHelper from './search-helper';

export default angular.module('hepicApp.search.services', [
  Search.name,
  SearchHelper.name,
]);
