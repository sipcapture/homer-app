import template from './templates/clock-widget.template.html';
import controller from './controllers/clock-widget.controller';

const clockWidget = {
  bindings: {
    widget: '<',
    onDelete: '&',
    onUpdate: '&',
  },
  controller,
  template,
};

export default clockWidget;
