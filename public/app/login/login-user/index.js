import angular from 'angular';
import component from './login-user.component';

export default angular.module('hepicApp.loginUser', [])
  .config(function($stateProvider, ROUTER) {
    'ngInject';
    $stateProvider.state(ROUTER.LOGIN.NAME, {
      url: ROUTER.LOGIN.PATH,
      views: {
        'main': {
          component: 'loginUser',
        },
      },
    });
  })
  .component('loginUser', component);
