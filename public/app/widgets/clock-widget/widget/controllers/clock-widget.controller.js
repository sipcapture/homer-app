import {cloneDeep} from 'lodash';

import 'angular-clock';
import 'angular-clock/dist/angular-clock.css';
import '../style/clock-widget.css';

import timezones from '../data/timezones';

class ClockWidget {

  constructor($log, $uibModal, ModalHelper) {
    'ngInject';
    this.$log = $log;
    this.$uibModal = $uibModal;
    this.ModalHelper = ModalHelper;
  }

  $onInit() {
    this.initLocation(this.widget);
  }

  initLocation(widget) {
    this.timezones = timezones;
    this.gmtOffset = timezones[widget.config.location];
    this.displayLocation = widget.config.location.split('/')[1].toUpperCase();
  }

  delete() {
    this.onDelete({uuid: this.widget.uuid});
  }

  update(widget) {
    this.initLocation(widget);
    this.onUpdate({uuid: this.widget.uuid, widget});
  }

  openSettings() {
    this.$uibModal.open({
      component: 'clockWidgetSettings',
      resolve: {
        widget: () => {
          return cloneDeep(this.widget);
        },
        timezones: () => {
          return cloneDeep(this.timezones);
        }
      }
    }).result.then((widget) => {
      this.update(widget);
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error('[ClockWidget]', '[settings]', error);
      }
    });
  }

}

export default ClockWidget;
