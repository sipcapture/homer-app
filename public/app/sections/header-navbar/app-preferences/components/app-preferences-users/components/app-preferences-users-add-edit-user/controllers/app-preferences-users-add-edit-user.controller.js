class AppPreferencesUsersAddEditUser {
  constructor() {
    'ngInject';
  }

  $onInit() {
    this._initUser();
    this.isNewUser = !Object.keys(this.user).length;
  }

  _initUser() {
    if (!this.resolve) {
      this.user = {};
    }
    this.user = this.resolve.user || {};
  }

  get passwordNotSet() {
    return this.isNewUser && (!this.user.password || !this.user.password.length);
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    this.modalInstance.close(this.user);
  }
}

export default AppPreferencesUsersAddEditUser;
