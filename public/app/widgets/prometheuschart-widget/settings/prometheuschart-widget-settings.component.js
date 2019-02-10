import template from './templates/promethuschart-widget-settings.template.html';
import controller from './controllers/prometheuschart-widget-settings.controller';

const prometheuschartWidgetSettings = {
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller,
  template,
};

export default prometheuschartWidgetSettings;
