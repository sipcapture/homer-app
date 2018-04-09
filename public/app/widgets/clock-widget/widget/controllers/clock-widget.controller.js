import 'angular-clock';
import 'angular-clock/dist/angular-clock.css';
import '../style/clock-widget.css';

import {cloneDeep} from 'lodash';

class ClockWidget {
  constructor($log, $uibModal, ModalHelper, TIMEZONES) {
    'ngInject';
    this.$log = $log;
    this.$uibModal = $uibModal;
    this.ModalHelper = ModalHelper;
    this.TIMEZONES = TIMEZONES;
  }

  $onInit() {
    this._widget = cloneDeep(this.widget);
  }

  get gmtOffset() {
    return this._widget.config.location.offset || '+1';
  }

  get locationName() {
    return this._widget.config.location.desc.toUpperCase() || 'unknown';
  }

  delete() {
    this.onDelete({uuid: this._widget.uuid});
  }

  update(widget) {
    this._widget = widget;
    this.onUpdate({uuid: this._widget.uuid, widget});
  }

  openSettings() {
    this.$uibModal.open({
      component: 'clockWidgetSettings',
      resolve: {
        widget: () => {
          return cloneDeep(this._widget);
        },
        timezones: () => {
          return this.TIMEZONES;
        },
      },
    }).result.then((widget) => {
      this.update(widget);
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error(['ClockWidget', 'settings'], error);
      }
    });
  }
}

export default ClockWidget;
