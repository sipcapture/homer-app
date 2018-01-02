import angular from 'angular';
import Services from './services';
import SearchCall from './search-call/search-call.module';

export default angular.module('hepicApp.search', [
  Services.name,
  SearchCall.name
]);
