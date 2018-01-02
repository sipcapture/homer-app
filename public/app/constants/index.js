import angular from 'angular';

import Configuration from './configuration';
import Events from './events';
import Metricsdatasource from './metricsdatasource';
import Resources from './resources';
import Router from './router';

export default angular.module('hepicApp.constants', [])
  .constant('CONFIGURATION', Configuration)
  .constant('EVENTS', Events)
  .constant('METRICSDATASOURCE', Metricsdatasource)
  .constant('RESOURCES', Resources)
  .constant('ROUTER', Router);
