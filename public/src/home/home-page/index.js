import angular from 'angular';
import component from './home-page.component';

export default angular.module('hepicApp.homePage', [])
  .config(function ($stateProvider) {
    $stateProvider.state('home', {
      url: '/home',
      component: 'homePage'
    });
  })
  .component('homePage', component);
