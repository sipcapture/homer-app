import angular from 'angular';
import TransactionDetail from './controllers/transaction-detail.controller';
//import component from './transaction-detail.component';

export default angular.module('hepicApp.transaction-detail', []).controller(TransactionDetail.name, TransactionDetail);
//export default angular.module('hepicApp.transaction-detail', [])
//  .component('transactionDetail', component);
