import template from './templates/promchart-widget-settings.template.html';
import controller from './controllers/promchart-widget-settings.controller';

const promchartWidgetSettings = {
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller,
  template,
};

export default promchartWidgetSettings;
