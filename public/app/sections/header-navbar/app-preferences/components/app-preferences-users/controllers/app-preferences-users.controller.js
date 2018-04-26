class AppPreferencesUsers {
  constructor($uibModal, $log) {
    'ngInject';
    this.$uibModal = $uibModal;
    this.$log = $log;
    this.smartTable = {
      options: {
        pagination: '',
        items_by_page: 10,
        displayed_pages: 7,
      },
    };
  }

  $onInit() {
    this.users = this.appPreferencesEditorData;
  }

  addUser() {
    this.$uibModal.open({
      component: 'appPreferencesUsersAddUser',
    }).result.then((user) => {
      debugger;
      this.users.push(user);
    }).catch((err) => {
      this.$log.info(err);
    });
  }
  
  editUser() {
  }

  deleteUser() {
  }
}

export default AppPreferencesUsers;
