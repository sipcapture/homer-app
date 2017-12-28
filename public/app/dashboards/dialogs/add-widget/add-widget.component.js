import template from './templates/add-widget.template.html';
import controller from './controllers/add-widget.controller';

const addWidget = {
  controller,
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<'
  }
};

export default addWidget;
