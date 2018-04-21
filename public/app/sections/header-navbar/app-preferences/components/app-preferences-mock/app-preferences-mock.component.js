import template from './templates/app-preferences-mock.template.html';
import controller from './controllers/app-preferences-mock.controller';

const appPreferencesMock = {
  controller,
  template,
  bindings: {
    appPreferencesEditorData: '<',
    appPreferencesEditorSchema: '<',
    appPreferencesEditorTrigger: '=',
    appPreferencesEditorPersist: '&',
  },
};

export default appPreferencesMock;
