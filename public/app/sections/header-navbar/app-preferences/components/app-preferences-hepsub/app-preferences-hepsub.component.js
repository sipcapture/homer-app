import template from './templates/app-preferences-hepsub.template.html';
import controller from './controllers/app-preferences-hepsub.controller';

const appPreferencesHepSub = {
  controller,
  template,
  bindings: {
    hepsubs: '<',
  },
};

export default appPreferencesHepSub;
