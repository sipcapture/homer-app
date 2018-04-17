import {cloneDeep} from 'lodash';

class AppPreferencesEditor {
  constructor($state) {
    'ngInject';
    this.$state = $state;
    this.sectionName = this.$state.params.sectionName;
  }

  $onInit() {
    this.editor = {
      data: cloneDeep(this.appPreferencesEditorData.data),
      schema: cloneDeep(this.appPreferencesEditorData.schema),
    };
  }
  
  onPersist(data) {
    this.appPreferencesEditorPersist({sectionName: this.sectionName, data});
  }
}

export default AppPreferencesEditor;
