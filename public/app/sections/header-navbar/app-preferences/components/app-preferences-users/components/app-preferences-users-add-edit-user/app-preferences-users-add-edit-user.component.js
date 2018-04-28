import template from './templates/app-preferences-users-add-edit-user.template.html';
import controller from './controllers/app-preferences-users-add-edit-user.controller';

const appPreferencesUsersAddEditUser = {
  controller,
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
};

export default appPreferencesUsersAddEditUser;
