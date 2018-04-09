import angular from 'angular';
import Log from './log.service';

export default angular.module('hepicApp.services.log', []).factory('log', /* @ngInject */ ($log) => new Log($log));
