import angular from 'angular';
import CallDetail from './call-detail';
import CallDetailExport from './call-detail-export';

export default angular.module('hepicApp.call-detail-components', [
  CallDetail.name,
  CallDetailExport.name,
]);
