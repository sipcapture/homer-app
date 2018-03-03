import angular from 'angular';
import HeaderNavbar from './header-navbar';
import DashboardsMenu from './dashboards-menu';
import DatePicker from './date-picker';

export default angular.module('hepicApp.navbar', [
  HeaderNavbar.name,
  DashboardsMenu.name,
  DatePicker.name,
]);
