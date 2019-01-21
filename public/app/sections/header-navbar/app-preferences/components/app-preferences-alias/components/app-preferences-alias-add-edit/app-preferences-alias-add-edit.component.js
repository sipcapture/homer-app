import template from './templates/app-preferences-alias-add-edit.template.html';
import controller from './controllers/app-preferences-alias-add-edit.controller';

const appPreferencesAliasAddEdit = {
  controller,
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
};

export default appPreferencesAliasAddEdit;
