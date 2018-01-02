import {assign} from 'lodash';
import '../style/clock-widget.settings.css';

class ClockWidgetSettings {

  constructor() {
    'ngInject';
  }

  $onInit() {
    this.digitalClock = false;
    this.widget = this.resolve.widget;
    this.timezones = this.resolve.timezones;

    this.form = {
      title: this.widget.title,
      config: {
        location: this.widget.config.location
      }
    };
  }

  setTimezone(name) {
    this.form.config.location = name;
  }

  dismiss() {
    this.modalInstance.dismiss();
  }
  
  submit() {
    assign(this.widget, this.form);
    this.modalInstance.close(this.widget);
  }
}

export default ClockWidgetSettings;
