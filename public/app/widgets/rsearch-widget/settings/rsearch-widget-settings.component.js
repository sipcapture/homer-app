import template from './templates/rsearch-widget-settings.template.html';
import controller from './controllers/rsearch-widget-settings.controller';

const rsearchWidgetSettings = {
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller,
  template,
};

export default rsearchWidgetSettings;
