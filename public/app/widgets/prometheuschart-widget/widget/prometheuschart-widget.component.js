import template from './templates/prometheuschart-widget.template.html';
import controller from './controllers/prometheuschart-widget.controller';

const prometheuschartWidget = {
  bindings: {
    widget: '<',
    onDelete: '&',
    onUpdate: '&',
  },
  controller,
  template,
};

export default prometheuschartWidget;
