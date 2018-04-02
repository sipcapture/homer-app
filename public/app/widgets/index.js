import angular from 'angular';
import Services from './services';
import Clock from './clock-widget';
import Quicksearch from './quicksearch-widget';
import Influxdbchart from './influxdbchart-widget';

export default angular.module('hepicApp.widgets', [
  Services.name,
  Clock.name,
  Quicksearch.name,
  Influxdbchart.name,
]);
