import template from './templates/app-preferences-alias.template.html';
import controller from './controllers/app-preferences-alias.controller';

const appPreferencesAlias = {
  controller,
  template,
  bindings: {
    alias: '<',
  },
};

export default appPreferencesAlias;
