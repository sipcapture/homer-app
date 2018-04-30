import template from './templates/app-preferences-user-settings.template.html';
import controller from './controllers/app-preferences-user-settings.controller';

const appPreferencesUserSettings = {
  controller,
  template,
  bindings: {
    userSettings: '<',
  },
};

export default appPreferencesUserSettings;
