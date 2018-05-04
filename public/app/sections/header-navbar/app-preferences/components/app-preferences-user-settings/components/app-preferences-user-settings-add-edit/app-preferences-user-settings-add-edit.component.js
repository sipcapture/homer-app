import template from './templates/app-preferences-user-settings-add-edit.template.html';
import controller from './controllers/app-preferences-user-settings-add-edit.controller';

const appPreferencesUserSettingsAddEdit = {
  controller,
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
};

export default appPreferencesUserSettingsAddEdit;
