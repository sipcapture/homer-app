import angular from 'angular';
import Clock from './clock-widget';
import Quicksearch from './quicksearch-widget';
import AWidget from './a-widget';

export default angular.module('hepicApp.widgets', [
  Clock.name,
  Quicksearch.name,
  AWidget.name
]);
