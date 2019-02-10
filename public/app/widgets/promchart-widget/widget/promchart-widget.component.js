import template from './templates/promchart-widget.template.html';
import controller from './controllers/promchart-widget.controller';

const promchartWidget = {
  bindings: {
    widget: '<',
    onDelete: '&',
    onUpdate: '&',
  },
  controller,
  template,
};

export default promchartWidget;
