import angular from 'angular';
import HeaderNavbar from './header-navbar';
import DashboardsMenu from './dashboards-menu';
import DatePicker from './date-picker';
import AutoRefresh from './auto-refresh';
import AppPreferences from './app-preferences';

export default angular.module('hepicApp.navbar', [
  HeaderNavbar.name,
  DashboardsMenu.name,
  DatePicker.name,
  AutoRefresh.name,
  AppPreferences.name,
]);
