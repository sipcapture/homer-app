import template from './templates/app-preferences-editor.template.html';
import controller from './controllers/app-preferences-editor.controller';

const appPreferencesEditor = {
  controller,
  template,
  bindings: {
    appPreferencesEditorData: '=',
    appPreferencesEditorPersist: '&',
  },
};

export default appPreferencesEditor;
