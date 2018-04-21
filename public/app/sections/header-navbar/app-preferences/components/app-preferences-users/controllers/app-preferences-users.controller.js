class AppPreferencesUsers {
  constructor() {
    'ngInject';
  }

  $onInit() {}
  
  onPersist(data) {
    this.appPreferencesEditorPersist({sectionName: 'users', data});
  }
}

export default AppPreferencesUsers;
