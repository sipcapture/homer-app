import template from './templates/app-preferences.template.html';
import controller from './controllers/app-preferences.controller';

const appPreferences = {
  controller,
  template,
  bindings: {
    appPreferences: '=',
  },
};

export default appPreferences;
