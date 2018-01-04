import angular from 'angular';
import Navbar from './navbar';
import DashboardsMenu from './dashboards-menu';

export default angular.module('hepicApp.navbar', [
  Navbar.name,
  DashboardsMenu.name
]);
