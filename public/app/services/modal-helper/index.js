import angular from 'angular';
import ModalHelper from './modal-helper.service';

export default angular.module('hepicApp.services.modal-helper.service', []).factory('ModalHelper', /* @ngInject */ () => new ModalHelper());
