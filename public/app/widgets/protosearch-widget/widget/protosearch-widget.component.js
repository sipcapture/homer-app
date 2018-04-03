import template from './templates/protosearch-widget.template.html';
import controller from './controllers/protosearch-widget.controller';

const protosearchWidget = {
  bindings: {
    widget: '<',
    onDelete: '&',
    onUpdate: '&',
  },
  controller,
  template,
};

export default protosearchWidget;
