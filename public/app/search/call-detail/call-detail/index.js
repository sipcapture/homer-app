import angular from 'angular';
import CallDetail from './controllers/call-detail.controller';

export default angular.module('hepicApp.call-detail', []).controller(CallDetail.name, CallDetail);
