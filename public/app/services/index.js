import angular from 'angular';
import ModalHelper from './modal-helper';
import UserProfile from './user-profile';
import GlobalProfile from './global-profile';
import TimeMachine from './time-machine';
import EventBus from './event-bus';
import Log from './log';
import UserService from './user-service';
import UserSettingsService from './user-settings-service';
import AliasService from './alias-service';
import AdvancedService from './advanced-service';
import MappingService from './mapping-service';
import HomerHelper from './homer-helper';

export default angular.module('hepicApp.services', [
  ModalHelper.name,
  UserProfile.name,
  GlobalProfile.name,
  TimeMachine.name,
  EventBus.name,
  Log.name,
  UserService.name,
  UserSettingsService.name,
  AliasService.name,
  AdvancedService.name,
  MappingService.name,
  HomerHelper.name,
]);
