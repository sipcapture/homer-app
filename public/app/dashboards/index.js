import angular from 'angular';
import Providers from './providers';
import MainDashboard from './main-dashboard';

export default angular.module('hepicApp.dashboards', [
  Providers.name,
  MainDashboard.name
]);
