import angular from 'angular';
import component from './search-call.component';

export default angular.module('searchCall', [])
  .config(function ($stateProvider, ROUTER) {
    'ngInject';
    $stateProvider.state(ROUTER.SEARCH.NAME, {
      url: ROUTER.SEARCH.PATH,
      component: 'searchCall'
    });
  })
  .component('searchCall', component);
