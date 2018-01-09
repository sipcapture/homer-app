import angular from 'angular';
import EventBus from './event-bus.service';

export default angular.module('hepicApp.services.event-bus.service', []).factory('EventBus', /* @ngInject */ ($rootScope) => new EventBus($rootScope));
