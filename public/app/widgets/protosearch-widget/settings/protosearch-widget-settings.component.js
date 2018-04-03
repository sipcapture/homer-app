import template from './templates/protosearch-widget-settings.template.html';
import controller from './controllers/protosearch-widget-settings.controller';

const protosearchWidgetSettings = {
  bindings: {
    resolve: '<',
    modalInstance: '<',
  },
  controller,
  template,
};

export default protosearchWidgetSettings;
