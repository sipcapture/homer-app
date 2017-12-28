import angular from 'angular';
import DashboardStorage from './dashboard-storage';

export default angular.module('hepicApp.dashboards.services', [
  DashboardStorage.name,
]);
