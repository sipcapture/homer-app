import angular from 'angular';
import HomerHelper from './homer-helper.service';

export default angular.module('hepicApp.services.homer-helper.service', []).factory('homerHelper', /* @ngInject */ () => new HomerHelper());
