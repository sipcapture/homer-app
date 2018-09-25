import angular from 'angular';
import messageSearch from './message-search';

export default angular.module('hepicApp.filters.messageSearch', []).filter('messageSearch', messageSearch);
