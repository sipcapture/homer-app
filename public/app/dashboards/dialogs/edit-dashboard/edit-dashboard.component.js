import template from './templates/edit-dashboard.template.html';
import controller from './controllers/edit-dashboard.controller';

const editDashboard = {
  controller,
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
};

export default editDashboard;
