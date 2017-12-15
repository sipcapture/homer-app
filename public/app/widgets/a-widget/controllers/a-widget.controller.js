import { cloneDeep } from 'lodash';

import controller from './a-widget.settings.controller.js';
import template from '../templates/a-widget.settings.template.html';

import some_static_data from '../data/some_static_data.json';

import '../style/a-widget.css';

const AWidgetCtrl = function($scope, $uibModal) {
  const self = this;

  /*
  * Init
  * Put initialization code for your controller here
  */
  self.$onInit = function () {
    // widget data owned by dashboard controller and should be changed by the dashboard controller only
    // cloneDeep the original widget data to avoid accidental change of its values
    self._widget = cloneDeep(self.widget);
  };

  /*
  * Delete widget
  */
  self.delete = function () {
    // bind delete to the dashboard controller method - deleteWidget()
    self.onDelete({ widget: self.widget });
  };

  /*
  * Update widget
  *
  * @param {object} widget
  */
  self.update = function (widget) {
    // bind update to the dashboard controller method - updateWidget()
    self.onUpdate({ widget });
  };

  /*
  * Open widget settings
  *
  * @resolve {object} widget
  * @resolve {object} some_static_data
  * @result {object} widget - modified widget
  */
  self.openSettings = function () {
    $uibModal
      .open({
        template,
        controller,
        controllerAs: '$ctrl',
        resolve: { // bind this controller data to the settings controller
          widget: function () {
            return self._widget;
          },
          some_static_data: function () {
            return self.some_static_data;
          }
        }
      })
      .result.then(function (widget) {
        self.update(widget);
      });
  };

};

AWidgetCtrl.$inject = ['$scope', '$uibModal'];
export default AWidgetCtrl;
