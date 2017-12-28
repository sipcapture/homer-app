import angular from 'angular';
import {findIndex, cloneDeep} from 'lodash';

class MainDashboard {
  
  constructor($stateParams, $log, storeService, EVENTS, SweetAlert, $state, $uibModal, CONFIGURATION, DashboardWidgetState, DashboardStorage) {
    'ngInject';
    this.$stateParams = $stateParams;
    this.$log = $log;
    this.storeService = storeService;
    this.EVENTS = EVENTS;
    this.SweetAlert = SweetAlert;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.CONFIGURATION = CONFIGURATION;
    this.DashboardWidgetState = DashboardWidgetState;
    this.DashboardStorage = DashboardStorage;
  }

  $onInit() {
    this.gridsterOptions = this.CONFIGURATION.DASHBOARD_DEFAULT;
    this.registeredWidgets = this.DashboardWidgetState.widgets;

    this.DashboardStorage.get(this.$stateParams.boardID).then((_dashboard_) => {
      this.dashboard = _dashboard_;

      if (!this.dashboard) {
        this.dashboard = {};
      }
      if (!this.dashboard.widgets) {
        this.dashboard.widgets = [];
      }

      //const currentUser = authService.getCurrentLoginUser(); // to-do: add user scopes
      //if (currentUser.permissions && currentUser.permissions.indexOf('admins') > -1) {
      //  this.dashboardEditDisable = false;
      //}

      //if (status.uuid && status.uuid != currentUser.uuid) {
      //  this.dashboardEditDisable = true;
      //} else {
      //  this.dashboardEditDisable = false;
      //}
    }).catch(function (error) {
      this.$log.error('[MainDashboard]', '[load dashboards]', error);
    });
  }

  deleteWidget(widget) {
    const index = findIndex(this.dashboard.widgets, w => w.name === widget.name);
    this.dashboard.widgets.splice(index, 1);
  }

  updateWidget(widget) {
    const index = findIndex(this.dashboard.widgets, w => w.name === widget.name);
    this.dashboard.widgets[index] = widget;
  }

  addWidget() {
    this.$uibModal.open({
      component: 'addWidget',
      resolve: {
        widgets: () => {
          return cloneDeep(this.registeredWidgets);
        }
      }
    }).result.then((widget) => {
      this.dashboard.widgets.push(widget);
    }).catch((reason) => {
      this.$log.info('[MainDashboard]', '[add widget modal]', reason);
    });
  }

  saveBoard() {
    this.storeService.set(this.dashboard.alias, angular.toJson(this.dashboard));
  }

  deleteBoard() {
    this.SweetAlert.swal({
      title: 'Are you sure?',
      text: 'Your will not be able to recover this!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      closeOnConfirm: true,
      closeOnCancel: true
    }).then((confirm) => {
      if (confirm) {
        this.storeService.delete(this.dashboard.id);
        this.$state.go('dashboard', { boardID: 'home' });
      }
    }).catch((error) => {
      this.$log.error('[MainDashboard]', '[delete board]', error);
    });
  }

  editBoard() {
    this.$uibModal.open({
      component: 'editDashboard',
      resolve: {
        dashboard: () => {
          return cloneDeep(this.dashboard);
        }
      }
    }).result.then(function (dashboard) {
      this.gridsterOptions = dashboard.config;
      this.dashboard = dashboard;
      this.dashboard.title = this.dashboard.name;
      this.dashboard.alias = this.dashboard.type;

      const config = {
        param: {
          shared: 0
        }
      };

      if (dashboard.name) {
        config.param.title = dashboard.name;
      }
      if (dashboard.shared) {
        config.param.shared = 1;
      }
      if (dashboard.param) {
        config.param.param = dashboard.param;
      }

      return this.storeService.update(dashboard.id, config).catch((error) => {
        this.$log.error('[MainDashboard]', '[update dashboard]', error);
      });
    }).catch((reason) => {
      this.$log.info('[MainDashboard]', '[edit dashboard modal]', reason);
    });
  }

}

export default MainDashboard;
