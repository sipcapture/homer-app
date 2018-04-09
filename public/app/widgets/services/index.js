import angular from 'angular';
import InfluxdbchartService from './influxdbchart-service';

export default angular.module('hepicApp.widgets.services', [
  InfluxdbchartService.name,
]);
