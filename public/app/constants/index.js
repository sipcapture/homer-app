import angular from 'angular';

import configuration from './configuration';
import events from './events';
import metricsdatasource from './metricsdatasource';
import resources from './resources';
import router from './router';
import api from './api';
import ui from './ui';
import timezones from './timezones';
import hepicsources from './hepicsources';
import search from './search';
import time from './time';

export default angular.module('hepicApp.constants', [])
  .constant('CONFIGURATION', configuration)
  .constant('EVENTS', events)
  .constant('METRICSDATASOURCE', metricsdatasource)
  .constant('RESOURCES', resources)
  .constant('API', api)
  .constant('ROUTER', router)
  .constant('UI', ui)
  .constant('HEPICSOURCES', hepicsources)
  .constant('TIMEZONES', timezones)
  .constant('SEARCH', search)
  .constant('TIME', time);
