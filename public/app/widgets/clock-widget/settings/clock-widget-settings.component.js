import template from './templates/clock-widget-settings.template.html';
import controller from './controllers/clock-widget-settings.controller';

const clockWidgetSettings = {
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller,
  template,
};

export default clockWidgetSettings;
