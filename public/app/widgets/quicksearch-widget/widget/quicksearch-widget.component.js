import template from './templates/quicksearch-widget.template.html';
import controller from './controllers/quicksearch-widget.controller';

const quicksearchWidget = {
  bindings: {
    widget: '<',
    onDelete: '&',
    onUpdate: '&',
  },
  controller,
  template,
};

export default quicksearchWidget;
