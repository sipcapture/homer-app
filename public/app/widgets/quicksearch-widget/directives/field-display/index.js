import angular from 'angular';
import FieldDisplay from './field-display.directive';

export default angular.module('hepicApp.field-display.directive', []).directive('fieldDisplay', /* @ngInject */ () => new FieldDisplay());
