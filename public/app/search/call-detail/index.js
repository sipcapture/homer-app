import angular from 'angular';
import CallDetail from './call-detail';
import Export from './export';
import Media from './media';

export default angular.module('hepicApp.call-detail-components', [
  CallDetail.name,
  Export.name,
  Media.name,
]);
