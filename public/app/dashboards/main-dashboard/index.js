import angular from 'angular';
import component from './main-dashboard.component';

export default angular.module('hepicApp.mainDashboard', [])
  .config(function ($stateProvider) {
    $stateProvider.state('dashboard', {
      url: '/dashboard/:boardID',
      component: 'mainDashboard',
      secure: true
    });
  })
  .component('mainDashboard', component);
