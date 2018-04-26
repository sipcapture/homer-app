import template from './templates/app-preferences-users.template.html';
import controller from './controllers/app-preferences-users.controller';

const appPreferencesUsers = {
  controller,
  template,
  bindings: {
    appPreferencesEditorData: '<',
  },
};

export default appPreferencesUsers;
