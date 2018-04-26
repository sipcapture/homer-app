import template from './templates/app-preferences-users-add-user.template.html';
import controller from './controllers/app-preferences-users-add-user.controller';

const appPreferencesUsersAddUser = {
  controller,
  template,
  bindings: {
    modalInstance: '<',
  },
};

export default appPreferencesUsersAddUser;
