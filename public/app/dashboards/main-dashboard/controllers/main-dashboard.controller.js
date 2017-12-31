import angular from 'angular';
import {findIndex, cloneDeep} from 'lodash';

class MainDashboard {
  
  constructor($stateParams, $log, EVENTS, SweetAlert, $state, $uibModal, CONFIGURATION, DashboardWidgetState, DashboardStorage, ModalHelper) {
    'ngInject';
    this.$stateParams = $stateParams;
    this.$log = $log;
    this.DashboardStorage = DashboardStorage;
    this.EVENTS = EVENTS;
    this.SweetAlert = SweetAlert;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.CONFIGURATION = CONFIGURATION;
    this.DashboardWidgetState = DashboardWidgetState;
    this.ModalHelper = ModalHelper;
  }

  $onInit() {
    this.gridsterOptions = this.CONFIGURATION.DASHBOARD_DEFAULT;
    this.registeredWidgets = this.DashboardWidgetState.widgets;
    this.initDashboard();
  }

  initDashboard() {
    return this.DashboardStorage.get(this.$stateParams.boardID).then((dashboard) => {
      this.dashboard = dashboard;

      if (!this.dashboard) {
        this.dashboard = {};
      }
      if (!this.dashboard.widgets) {
        this.dashboard.widgets = [];
      }
      // to-do: add user scopes
    }).catch((error) => {
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
    this.DashboardStorage.set(this.dashboard.alias, angular.toJson(this.dashboard));
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
    }, (confirm) => {
      if (this.dashboard.alias === 'home') {
        this.$log.warn('Dashboard "Home" cannot be deleted.');
        return;
      }

      if (confirm) {
        this.DashboardStorage.delete(this.dashboard.id).then(() => {
          return this.$state.go('dashboard', {boardID: 'home'});
        }).catch((error) => {
          this.$log.error('[MainDashboard]', '[delete board]', error);
        });
      }
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
    }).result.then((dashboard) => {
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

      return this.DashboardStorage.update(dashboard.id, config);
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.info('[MainDashboard]', '[update dashboard]', error);
      }
    });
  }

}

export default MainDashboard;
