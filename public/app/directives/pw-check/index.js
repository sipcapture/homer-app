import angular from 'angular';
import PwCheck from './pw-check.directive';

export default angular.module('hepicApp.directives.pw-check', []).directive('pwCheck', /* @ngInject */ () => new PwCheck());
