import template from './templates/app-preferences-mapping-add-edit.template.html';
import controller from './controllers/app-preferences-mapping-add-edit.controller';

const appPreferencesMappingAddEdit = {
  controller,
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
};

export default appPreferencesMappingAddEdit;
