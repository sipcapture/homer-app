class AppPreferencesMock {
  constructor($state) {
    'ngInject';
  }

  $onInit() {
  }
  
  onPersist(data) {
    this.appPreferencesEditorPersist({sectionName: this.sectionName, data});
  }
}

export default AppPreferencesMock;
