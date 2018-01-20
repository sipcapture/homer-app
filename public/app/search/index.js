import angular from 'angular';
import hepicModal from './hepic-modal';
import Services from './services';
import SearchCall from './search-call';
import TransactionDetail from './transaction-detail';

export default angular.module('hepicApp.search', [
  hepicModal.name,
  Services.name,
  SearchCall.name,
  TransactionDetail.name
]);
