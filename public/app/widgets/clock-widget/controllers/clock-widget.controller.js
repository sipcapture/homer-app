import 'angular-clock';
import 'angular-clock/dist/angular-clock.css';
import '../style/clock-widget.css';

import controller from './clock-widget.settings.controller.js';
import template from '../templates/clock-widget.settings.template.html';

import timezones from '../data/timezones';

const injectParams = ['$scope', '$timeout', '$uibModal'];
const ClockWidgetCtrl = function($scope, $timeout, $uibModal) {
  const self = this;

  const initLocation = function (widget) {
    self.timezones = timezones;
    self.gmtOffset = timezones[widget.config.location];
    self.displayLocation = widget.config.location.split('/')[1].toUpperCase();
  };

  self.delete = function () {
    self.onDelete({ widget: self.widget });
  };

  self.update = function (widget) {
    initLocation(widget);
    self.onUpdate({ widget });
  };

  self.openSettings = function () {
    $uibModal
      .open({
        controllerAs: '$ctrl',
        controller,
        template,
        resolve: {
          widget: function () {
            return self.widget;
          },
          timezones: function () {
            return self.timezones;
          }
        }
      })
      .result.then(function (widget) {
        self.update(widget);
      });
  };

  self.$onInit = function () {
    initLocation(self.widget);
  };

};

ClockWidgetCtrl.$inject = injectParams;
export default ClockWidgetCtrl;
