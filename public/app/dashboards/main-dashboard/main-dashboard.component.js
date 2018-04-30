import template from './templates/main-dashboard.template.html';
import controller from './controllers/main-dashboard.controller';

const mainDashboard = {
  controller,
  template,
  bindings: {
    dashboard: '<',
  },
};

export default mainDashboard;
