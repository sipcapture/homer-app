import template from './templates/a-widget.template.html';
import controller from './controllers/a-widget.controller';

const aWidget = {
  bindings: {
    widget: '<',
    onDelete: '&',
    onUpdate: '&'
  },
  controller,
  template
};

export default aWidget;
