import angular from 'angular';
import component from './search-call.component';

export default angular.module('searchCall', [])
  .config(function ($stateProvider) {
    $stateProvider.state('hepic.searchCall', {
      url: '/searchCall/:protoID',
      component: 'searchCall',
      secure: true
    });
  })
  .component('searchCall', component);
