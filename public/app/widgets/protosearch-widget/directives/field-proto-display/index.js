import angular from 'angular';
import FieldProtoDisplay from './field-proto-display.directive';

export default angular.module('hepicApp.field-proto-display.directive', []).directive('fieldProtoDisplay', /* @ngInject */ () => new FieldProtoDisplay());
