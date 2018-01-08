import angular from 'angular';
import TimeMachine from './time-machine.service';

export default angular.module('hepicApp.services.time-machine.service', []).factory('TimeMachine', /* @ngInject */ () => new TimeMachine());
