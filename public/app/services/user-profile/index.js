import angular from 'angular';
import UserProfile from './user-profile.service';

export default angular.module('hepicApp.services.user-profile.service', [])
  .factory('UserProfile', /* @ngInject */ ($http, API, TimeMachine) => new UserProfile($http, API, TimeMachine));
