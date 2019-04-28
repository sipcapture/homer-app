import template from './templates/app-preferences-hepsub-add-edit.template.html';
import controller from './controllers/app-preferences-hepsub-add-edit.controller';

const appPreferencesHepSubAddEdit = {
  controller,
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
};

export default appPreferencesHepSubAddEdit;
