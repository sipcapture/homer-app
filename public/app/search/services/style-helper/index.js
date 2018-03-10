import angular from 'angular';
import StyleHelper from './style-helper.service';

export default angular.module('hepicApp.services.style-helper.service', []).factory('StyleHelper', /* @ngInject */ () => new StyleHelper());
