import angular from 'angular';
import Providers from './providers';
import Services from './services';
import Dialogs from './dialogs';
import MainDashboard from './main-dashboard';

export default angular.module('hepicApp.dashboards', [
  Providers.name,
  Services.name,
  Dialogs.name,
  MainDashboard.name,
]);
