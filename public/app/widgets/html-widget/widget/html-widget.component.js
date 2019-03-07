import template from './templates/html-widget.template.html';
import controller from './controllers/html-widget.controller';

const htmlWidget = {
  bindings: {
    widget: '<',
    onDelete: '&',
    onUpdate: '&',
  },
  controller,
  template,
};

export default htmlWidget;
