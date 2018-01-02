import angular from 'angular';
import Authentication from './authentication';

export default angular.module('hepicApp.login.services', [
  Authentication.name,
]);
