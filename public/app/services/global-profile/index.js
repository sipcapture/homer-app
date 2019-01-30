import angular from 'angular';
import GlobalProfile from './global-profile.service';

export default angular.module('hepicApp.services.global-profile.service', [])
  .factory('GlobalProfile', /* @ngInject */ ($http, $log, API, TimeMachine, SEARCH) => new GlobalProfile($http, $log, API, TimeMachine, SEARCH));
