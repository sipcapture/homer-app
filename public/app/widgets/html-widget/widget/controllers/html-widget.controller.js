import {cloneDeep} from 'lodash';

class HtmlWidget {
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

  delete() {
    this.onDelete({uuid: this._widget.uuid});
  }

  update(widget) {
    this._widget = widget;
    this.onUpdate({uuid: this._widget.uuid, widget});
  }

  openSettings() {
    this.$uibModal.open({
      component: 'htmlWidgetSettings',
      resolve: {
        widget: () => {
          return cloneDeep(this._widget);
        },
      },
    }).result.then((widget) => {
      this.update(widget);
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error(['HtmlWidget', 'settings'], error);
      }
    });
  }
}

export default HtmlWidget;
