import angular from 'angular';
import ModalHelper from './modal-helper';
import UserProfile from './user-profile';
import TimeMachine from './time-machine';
import EventBus from './event-bus';
import Log from './log';
import UserService from './user-service';
import UserSettingsService from './user-settings-service';

export default angular.module('hepicApp.services', [
  ModalHelper.name,
  UserProfile.name,
  TimeMachine.name,
  EventBus.name,
  Log.name,
  UserService.name,
  UserSettingsService.name,
]);
