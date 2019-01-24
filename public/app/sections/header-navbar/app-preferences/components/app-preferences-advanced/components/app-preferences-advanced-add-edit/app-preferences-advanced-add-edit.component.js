import template from './templates/app-preferences-advanced-add-edit.template.html';
import controller from './controllers/app-preferences-advanced-add-edit.controller';

const appPreferencesAdvancedAddEdit = {
  controller,
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
};

export default appPreferencesAdvancedAddEdit;
