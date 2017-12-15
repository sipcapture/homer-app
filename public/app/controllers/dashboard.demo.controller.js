import app from '../app.demo';
import { forEach } from 'lodash';

const injectParams = ['$scope', '$timeout', 'StorageService'];
const DashboardCtrl = function ($scope, $timeout, StorageService) {

  $scope.gridsterOptions = {
    margins: [20, 20],
    columns: 4,
    draggable: {
      handle: 'h3'
    }
  };

  $scope.dashboards = StorageService.listDashboards();

  forEach($scope.dashboards, function (dashboard) {
    app.stateProvider.state({
      name: dashboard.name,
      url: dashboard.url,
      component: dashboard.component
    });
  });

  $scope.dashboard = $scope.dashboards.home;
  StorageService.saveDashboards($scope.dashboards);

  $scope.clear = function() {
    $scope.dashboard.widgets = [];
    $scope.dashboards[$scope.dashboard.view] = $scope.dashboard;
    StorageService.saveDashboards($scope.dashboards);
  };

  $scope.addWidget = function() {
    $scope.dashboard.widgets.push({
      name: 'New Widget',
      sizeX: 1,
      sizeY: 1
    });
    $scope.dashboards[$scope.dashboard.view] = $scope.dashboard;
    StorageService.saveDashboards($scope.dashboards);
  };

  $scope.setCurrentDashboard = function (name) {
    $scope.dashboard = $scope.dashboards[name];
  };

};

DashboardCtrl.$inject = injectParams;
export default DashboardCtrl;
