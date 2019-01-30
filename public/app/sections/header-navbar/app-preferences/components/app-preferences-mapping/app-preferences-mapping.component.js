import template from './templates/app-preferences-mapping.template.html';
import controller from './controllers/app-preferences-mapping.controller';

const appPreferencesMapping = {
  controller,
  template,
  bindings: {
    mappings: '<',
  },
};

export default appPreferencesMapping;
