import angular from 'angular';
import {findIndex, cloneDeep, assign} from 'lodash';
import uuid from 'uuid/v4'; // temporary, delete when uuid added in DB

class MainDashboard {
  constructor($stateParams, $rootScope, $log, EVENTS, SweetAlert, $state, $uibModal,
    CONFIGURATION, DashboardWidgetState, DashboardStorage, ModalHelper, ROUTER, EventBus) {
    'ngInject';
    this.$stateParams = $stateParams;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.DashboardStorage = DashboardStorage;
    this.EVENTS = EVENTS;
    this.SweetAlert = SweetAlert;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.CONFIGURATION = CONFIGURATION;
    this.DashboardWidgetState = DashboardWidgetState;
    this.ModalHelper = ModalHelper;
    this.ROUTER = ROUTER;
    this.EventBus = EventBus;
  }

  $onInit() {
    this.gridsterOptions = this.CONFIGURATION.DASHBOARD_DEFAULT;
    this.registeredWidgets = this.DashboardWidgetState.widgets;
  
    if (!this.dashboard) {
      this.dashboard = {};
    }

    if (!this.dashboard.widgets) {
      this.dashboard.widgets = [];
    }

    this.dashboard.widgets.forEach((w) => { // temporary, delete when uuid added in DB
      if (!w.uuid) {
        w.uuid = uuid();
      }
    });
  }

  deleteWidget(uuid) {
    const index = findIndex(this.dashboard.widgets, (w) => w.uuid === uuid);
    this.dashboard.widgets.splice(index, 1);
  }

  updateWidget(uuid, widget) {
    const index = findIndex(this.dashboard.widgets, (w) => w.uuid === uuid);
    this.dashboard.widgets[index] = widget;
  }

  addWidget() {
    this.$uibModal.open({
      component: 'addWidget',
      resolve: {
        widgets: () => {
          return cloneDeep(this.registeredWidgets);
        },
      },
    }).result.then((widget) => {
      this.dashboard.widgets.push(widget);
    }).catch((reason) => {
      this.$log.info('[MainDashboard]', '[add widget modal]', reason);
    });
  }

  async saveBoard() {
    try {
      return await this.DashboardStorage.set(this.dashboard.alias, angular.toJson(this.dashboard));
    } catch (err) {
      this.$log.error(['MainDashboard'], ['save board'], err);
    }
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
      closeOnCancel: true,
    }, (confirm) => {
      if (this.dashboard.alias === 'home') {
        this.$log.warn('Dashboard "Home" cannot be deleted.');
        return;
      }

      if (confirm) {
        this.DashboardStorage.delete(this.dashboard.id).then(() => {
          this.EventBus.broadcast(this.EVENTS.DASHBOARD_DELETED, {dashboardId: this.dashboard.id});
          this.goHomeDashboard();
        }).catch((error) => {
          this.$log.error(['MainDashboard'], ['delete board'], error);
        });
      }
    });
  }

  goHomeDashboard() {
    return this.$state.go(this.$state.current, {boardID: this.ROUTER.HOME.NAME, reload: true, inherit: false});
  }

  editBoard() {
    this.$uibModal.open({
      component: 'editDashboard',
      resolve: {
        dashboard: () => {
          return cloneDeep(this.dashboard);
        },
      },
    }).result.then((dashboard) => {
      this.gridsterOptions = assign(this.gridsterOptions, dashboard.config);
      this.dashboard = dashboard;
      this.dashboard.alias = this.dashboard.type;

      const update = {
        name: this.dashboard.name,
        shared: this.dashboard.shared ? 1 : 0,
        param: this.dashboard.param || '',
      };

      return this.DashboardStorage.update(dashboard.id, update).then(() => {
        this.EventBus.broadcast(this.EVENTS.DASHBOARD_UPDATE_SETTINGS, {dashboardId: this.dashboard.id, update});
      });
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.info('[MainDashboard]', '[update dashboard]', error);
      }
    });
  }
}

export default MainDashboard;
