import template from './templates/header-navbar.template.html';
import controller from './controllers/header-navbar.controller';

const headerNavbar = {
  controller,
  template,
  bindings: {
    dashboardsMenu: '<',
    globalsettings: '<',
    users: '<',
    userSettings: '<',
    aliases: '<',
    mappings: '<',
    hepsub: '<',
  },
};

export default headerNavbar;
