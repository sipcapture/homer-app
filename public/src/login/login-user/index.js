import angular from 'angular';
import component from './login-user.component';

export default angular.module('hepicApp.loginUser', [])
  .config(function ($stateProvider) {
    $stateProvider.state('login', {
      url: '/login',
      component: 'loginUser'
    });
  })
  .component('loginUser', component);
