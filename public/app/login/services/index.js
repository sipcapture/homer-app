import angular from 'angular';
import Authentication from './authentication';
import AuthenticationInterceptor from './authentication-interceptor';

export default angular.module('hepicApp.login.services', [
  Authentication.name,
  AuthenticationInterceptor.name
]);
