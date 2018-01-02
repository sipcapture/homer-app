import template from './templates/add-dashboard.template.html';
import controller from './controllers/add-dashboard.controller';

const addDashboard = {
  controller,
  template,
  bindings: {
    modalInstance: '<'
  }
};

export default addDashboard;
