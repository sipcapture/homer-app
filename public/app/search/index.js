import angular from 'angular';
import hepicModal from './hepic-modal';
import Services from './services';
import CallSearch from './call-search';
import CallDetail from './call-detail';
import CallMessageDetail from './call-message-detail';

export default angular.module('hepicApp.search', [
  hepicModal.name,
  Services.name,
  CallSearch.name,
  CallDetail.name,
  CallMessageDetail.name,
]);
