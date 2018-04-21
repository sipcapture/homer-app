import template from './templates/header-navbar.template.html';
import controller from './controllers/header-navbar.controller';

const headerNavbar = {
  controller,
  template,
  bindings: {
    dashboardsMenu: '<',
    appPreferences: '=',
  },
};

export default headerNavbar;
