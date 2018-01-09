import angular from 'angular';
import Services from './services';
import SearchCall from './search-call';

export default angular.module('hepicApp.search', [
  Services.name,
  SearchCall.name
]);
