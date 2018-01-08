import angular from 'angular';
import ModalHelper from './modal-helper';
import UserProfile from './user-profile';
import TimeMachine from './time-machine';

export default angular.module('hepicApp.services', [
  ModalHelper.name,
  UserProfile.name,
  TimeMachine.name
]);
