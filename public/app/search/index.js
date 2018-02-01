import angular from 'angular';
import hepicModal from './hepic-modal';
import Services from './services';
import SearchCall from './search-call';
import CallDetail from './call-detail';
import CallMessageDetail from './call-message-detail';

export default angular.module('hepicApp.search', [
  hepicModal.name,
  Services.name,
  SearchCall.name,
  CallDetail.name,
  CallMessageDetail.name,
]);
