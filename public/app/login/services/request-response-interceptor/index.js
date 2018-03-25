import angular from 'angular';
import RequestResponseInterceptor from './request-response-interceptor.service';

export default angular.module('hepicApp.login.request-response-interceptor.service', [])
  .factory('RequestResponseInterceptor', /* @ngInject */ ($state, $log, ROUTER) => new RequestResponseInterceptor($state, $log, ROUTER));
