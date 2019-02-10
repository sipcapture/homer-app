import template from './templates/html-widget-settings.template.html';
import controller from './controllers/html-widget-settings.controller';

const htmlWidgetSettings = {
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller,
  template,
};

export default htmlWidgetSettings;
