import template from './templates/clock-widget-settings.template.html';
import controller from './controllers/clock-widget-settings.controller';

const clockWidget = {
  bindings: {
    modalInstance: '<',
    resolve: '<'
  },
  controller,
  template
};

export default clockWidget;
