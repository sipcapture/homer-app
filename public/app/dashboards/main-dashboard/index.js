import angular from 'angular';
import component from './main-dashboard.component';

export default angular.module('hepicApp.mainDashboard', [])
  .config(function($stateProvider, ROUTER) {
    'ngInject';
    $stateProvider.state(ROUTER.DASHBOARD.NAME, {
      url: ROUTER.DASHBOARD.PATH,
      component: 'mainDashboard',
      resolve: {
        dashboard: function($log, $stateParams, DashboardStorage) {
          return DashboardStorage.get($stateParams.boardID).catch(function(err) {
            $log.error(['mainDashboard state'], ['resolve dashboard'], err);
          });
        },
      },
    });
  })
  .component('mainDashboard', component);
