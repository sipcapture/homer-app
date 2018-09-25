import angular from 'angular';
import propsFilter from './props-filter';
import messageSearch from './message-search';

export default angular.module('hepicApp.filters', [
  propsFilter.name,
  messageSearch.name
]);
