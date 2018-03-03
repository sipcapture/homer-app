import angular from 'angular';
import component from './main-dashboard.component';

export default angular.module('hepicApp.mainDashboard', [])
  .config(function($stateProvider, ROUTER) {
    'ngInject';
    $stateProvider.state(ROUTER.DASHBOARD.NAME, {
      url: ROUTER.DASHBOARD.PATH,
      component: 'mainDashboard',
    });
  })
  .component('mainDashboard', component);
