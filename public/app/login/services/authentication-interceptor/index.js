import angular from 'angular';
import AuthenticationInterceptor from './authentication-interceptor.service';

export default angular.module('hepicApp.login.authentication-interceptor.service', [])
  .factory('AuthenticationInterceptor', /* @ngInject */ ($state, $log, ROUTER) => new AuthenticationInterceptor($state, $log, ROUTER));
