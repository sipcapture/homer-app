/*global angular*/
import { findIndex, cloneDeep } from 'lodash';

import addWidgetTemplate from '../dialogs/addWidget/addWidget.dialog.template.html';
import addWidgetController from '../dialogs/addWidget/addWidget.dialog.controller';
import editDashboardTemplate from '../dialogs/editDashboard/editDashboard.dialog.template.html';
import editDashboardController from '../dialogs/editDashboard/editDashboard.dialog.controller';

const injectParams = [
  '$stateParams',
  '$log',
  'storeService',
  'authService',
  'eventbus',
  'EVENTS',
  'SweetAlert',
  '$state',
  'dialogs',
  '$uibModal',
  'CONFIGURATION',
  'dashboardWidgetState'
];

const MainDashboardCtrl = function($stateParams, $log, storeService, authService,
  eventbus, EVENTS, SweetAlert, $state, $dialogs, $uibModal, CONFIGURATION, dashboardWidgetState) {

  const self = this;

  self.$onInit = function () {
    self.gridsterOptions = CONFIGURATION.DASHBOARD_DEFAULT;
    self.widgetState = dashboardWidgetState.widgets;

    storeService.get($stateParams.boardID)
      .then(function (_dashboard_) {
        self.dashboard = _dashboard_;

        if (!self.dashboard) {
          self.dashboard = {};
        }
        if (!self.dashboard.widgets) {
          self.dashboard.widgets = [];
        }

        const currentUser = authService.getCurrentLoginUser();
        if (currentUser.permissions && currentUser.permissions.indexOf('admins') > -1) {
          self.dashboardEditDisable = false;
        }

        if (status.uuid && status.uuid != currentUser.uuid) {
          self.dashboardEditDisable = true;
        } else {
          self.dashboardEditDisable = false;
        }
      })
      .catch(function (error) {
        $log.error('[mainDashboardCtrl]', error);
      });
  };

  self.deleteWidget = function (widget) {
    const index = findIndex(self.dashboard.widgets, w => w.name === widget.name);
    self.dashboard.widgets.splice(index, 1);
  };

  self.updateWidget = function (widget) {
    const index = findIndex(self.dashboard.widgets, w => w.name === widget.name);
    self.dashboard.widgets[index] = widget;
  };

  self.addWidget = function () {
    $uibModal
      .open({
        controllerAs: '$ctrl',
        controller: addWidgetController,
        template: addWidgetTemplate,
        resolve: {
          widgets: function () {
            return cloneDeep(self.widgetState);
          }
        }
      })
      .result.then(function (widget) {
        self.dashboard.widgets.push(widget);
      });
  };

  self.saveBoard = function() {
    storeService.set(self.dashboard.alias, angular.toJson(self.dashboard));
  };

  self.deleteBoard = function () {
    SweetAlert.swal({
      title: 'Are you sure?',
      text: 'Your will not be able to recover this!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      closeOnConfirm: true,
      closeOnCancel: true
    }, function (confirm) {
      if (confirm) {
        storeService.delete(self.dashboard.id);
        $state.go('dashboard', { boardID: 'home' });
        eventbus.broadcast(EVENTS.DASHBOARD_CHANGED, self.dashboard.id);
      }
    });
  };

  self.editBoard = function () {
    $uibModal
      .open({
        controllerAs: '$ctrl',
        controller: editDashboardController,
        template: editDashboardTemplate,
        resolve: {
          dashboard: function () {
            return cloneDeep(self.dashboard);
          }
        }
      })
      .result.then(function (dashboard) {
        if (dashboard.type === 'frame') {
          eventbus.broadcast(EVENTS.DASHFRAME_NEW_SETTINGS, dashboard);
        } else {
          self.gridsterOptions = dashboard.config;
          self.dashboard = dashboard;
          self.dashboard.title = self.dashboard.name;
          self.dashboard.alias = self.dashboard.type;
        }

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

        storeService.update(dashboard.id, config)
          .then(function () {
            eventbus.broadcast(EVENTS.DASHBOARD_CHANGED, '1');
          })
          .catch(function (error) {
            $log.error('main-dashboard', 'editBoard', error);
          });
      });
  };

};

MainDashboardCtrl.$inject = injectParams;
export default MainDashboardCtrl;
