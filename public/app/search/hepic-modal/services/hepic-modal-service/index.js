import angular from 'angular';
import HepicModalService from './hepic-modal.service';

export default angular.module('hepicApp.hepicModal.service', [])
  .factory('hepicModalService', /* @ngInject */ () => new HepicModalService());
