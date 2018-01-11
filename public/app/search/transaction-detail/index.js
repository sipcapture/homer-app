import angular from 'angular';
import TransactionDetail from './controllers/transaction-detail.controller';

export default angular.module('hepicApp.transaction-detail', []).controller(TransactionDetail.name, TransactionDetail);
