import angular from 'angular';
import component from './app-preferences.component';

export default angular.module('hepicApp.appPreferences', [])
  .config(function($stateProvider, ROUTER) {
    'ngInject';
    $stateProvider.state(ROUTER.PREFERENCES.NAME, {
      url: ROUTER.PREFERENCES.PATH,
      component: 'appPreferences',
    });
  })
  .component('appPreferences', component);
