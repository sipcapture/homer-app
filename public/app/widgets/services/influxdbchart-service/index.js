import angular from 'angular';
import InfluxdbchartService from './influxdbchart.service';

export default angular.module('hepicApp.widgets.services.influxdbchart', [])
  .factory('InfluxdbchartService', /* @ngInject */ ($http, CONFIGURATION) => new InfluxdbchartService($http, CONFIGURATION));
