import angular from 'angular';
import Search from './search';
import SearchHelper from './search-helper';
import StyleHelper from './style-helper';

export default angular.module('hepicApp.search.services', [
  Search.name,
  SearchHelper.name,
  StyleHelper.name,
]);
