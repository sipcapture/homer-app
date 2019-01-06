import template from './templates/rsearch-widget.template.html';
import controller from './controllers/rsearch-widget.controller';

const rsearchWidget = {
  bindings: {
    widget: '<',
    onDelete: '&',
    onUpdate: '&',
  },
  controller,
  template,
};

export default rsearchWidget;
