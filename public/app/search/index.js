import angular from 'angular';
import Services from './services';
import SearchCall from './search-call';
import TransactionDetail from './transaction-detail';

export default angular.module('hepicApp.search', [
  Services.name,
  SearchCall.name,
  TransactionDetail.name
]);
