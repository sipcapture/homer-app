import { assign, cloneDeep } from 'lodash';
import '../style/clock-widget.settings.css';

const injectParams = ['widget', 'timezones', '$uibModalInstance'];
const ClockWidgetSettingsCtrl = function(widget, timezones, $uibModalInstance) {
  const self = this;

  self.digitalClock = false;
  self.widget = cloneDeep(widget);
  self.timezones = timezones;

  self.form = {
    title: self.widget.title,
    config: {
      location: self.widget.config.location
    }
  };

  self.setTimezone = function (name) {
    self.form.config.location = name;
  };

  self.dismiss = function() {
    $uibModalInstance.dismiss();
  };
  
  self.submit = function() {
    assign(self.widget, self.form);
    $uibModalInstance.close(self.widget);
  };
};

ClockWidgetSettingsCtrl.$inject = injectParams;
export default ClockWidgetSettingsCtrl;
