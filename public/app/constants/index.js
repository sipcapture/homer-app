import angular from 'angular';

import Configuration from './configuration';
import Events from './events';
import Metricsdatasource from './metricsdatasource';
import Resources from './resources';
import Router from './router';
import Api from './api';
import Ui from './ui';

export default angular.module('hepicApp.constants', [])
  .constant('CONFIGURATION', Configuration)
  .constant('EVENTS', Events)
  .constant('METRICSDATASOURCE', Metricsdatasource)
  .constant('RESOURCES', Resources)
  .constant('API', Api)
  .constant('ROUTER', Router)
  .constant('UI', Ui);
