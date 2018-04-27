class AppPreferencesUsersAddEditUser {
  constructor() {
    'ngInject';
  }

  $onInit() {
    this._initUser();
  }

  _initUser() {
    if (!this.resolve) {
      this.user = {};
    }
    this.user = this.resolve.user || {};
    this._splitName(this.user);
  }

  _splitName(user) {
    if (!!user.name.length && !user.firstname || !user.lastname) {
      const splittedName = user.name.split(' ');
      user.firstname = splittedName[0];
      user.lastname = splittedName.slice(1, splittedName.length).join(' ');
    }
  }

  _mergeName(user) {
    user.name = [user.firstname, user.lastname].join(' ');
  }

  _isNewUser(user) {
    return !!Object.keys(user);
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    this._mergeName(this.user);
    this.modalInstance.close(this.user);
  }
}

export default AppPreferencesUsersAddEditUser;
