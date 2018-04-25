import angular from 'angular';
import Directives from './directives';
import Services from './services';

export default angular.module('hepicApp.hepic-modal', [
  Directives.name,
  Services.name,
]);
