import template from './templates/dashboards-menu.template.html';
import controller from './controllers/dashboards-menu.controller';

const dashboardsMenu = {
  controller,
  template,
  bindings: {
    dashboards: '<',
  },
};

export default dashboardsMenu;
