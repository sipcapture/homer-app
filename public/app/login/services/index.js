import angular from 'angular';
import Authentication from './authentication';
import RequestResponseInterceptor from './request-response-interceptor';

export default angular.module('hepicApp.login.services', [
  Authentication.name,
  RequestResponseInterceptor.name,
]);
