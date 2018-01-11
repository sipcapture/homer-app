import angular from 'angular';
import TransactionMessage from './controllers/transaction-message.controller';

export default angular.module('hepicApp.transaction-message', []).controller(TransactionMessage.name, TransactionMessage);
