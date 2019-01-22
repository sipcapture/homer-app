import angular from 'angular';
import SmartTableWithDynamicOptionsController from './smart-table-with-dynamic-options';
import SmartTableWithDynamicOptionsTemplate from './smart-table-with-dynamic-options.html';
import SmartTableWithDynamicOptionsEditController from './_smart-table-with-dynamic-options-edit';
import SmartTableWithDynamicOptionsEditTemplate from './_smart-table-with-dynamic-options-edit.html';

const SmartTableWithDynamicOptions = {
  controller: SmartTableWithDynamicOptionsController,
  template: SmartTableWithDynamicOptionsTemplate,
  bindings: {
    tableData: '<', // array of objects
    visibleColsNames: '<', // array of strings
    onAddRow: '&',
    onDeleteRow: '&',
    onEditRow: '&'
  },
};

const SmartTableWithDynamicOptionsEdit = {
  controller: SmartTableWithDynamicOptionsEditController,
  template: SmartTableWithDynamicOptionsEditTemplate,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
};

export default angular.module('hepicApp.SmartTableWithDynamicOptions', [])
  .component('smartTableWithDynamicOptions', SmartTableWithDynamicOptions)
  .component('smartTableWithDynamicOptionsEdit', SmartTableWithDynamicOptionsEdit);
