import template from './templates/quicksearch-widget-settings.template.html';
import controller from './controllers/quicksearch-widget-settings.controller';

const quicksearchWidgetSettings = {
  bindings: {
    resolve: '<',
    modalInstance: '<',
  },
  controller,
  template,
};

export default quicksearchWidgetSettings;
