class AppPreferencesUsersAddUser {
  constructor() {
    'ngInject';
    this.user = {};
  }

  $onInit() {
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    this.modalInstance.close(this.user);
  }
}

export default AppPreferencesUsersAddUser;
