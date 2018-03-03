import angular from 'angular';

import AddDashboard from './add-dashboard';
import EditDashboard from './edit-dashboard';
import AddWidget from './add-widget';

export default angular.module('hepicApp.dashboard.dialogs', [
  AddDashboard.name,
  EditDashboard.name,
  AddWidget.name,
]);
