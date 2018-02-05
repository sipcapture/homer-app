import angular from 'angular';
import component from './call-search.component';

export default angular.module('callSearch', [])
  .config(function ($stateProvider, ROUTER) {
    'ngInject';
    $stateProvider.state(ROUTER.SEARCH.NAME, {
      url: ROUTER.SEARCH.PATH,
      component: 'callSearch'
    });
  })
  .component('callSearch', component);
