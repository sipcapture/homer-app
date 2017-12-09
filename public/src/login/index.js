import angular from 'angular';
import LoginUser from './login-user';
import Services from './services';

export default angular.module('hepicApp.login', [
  LoginUser.name,
  Services.name
]);
