class AppPreferencesUserSettingsAddEdit {
  constructor() {
    'ngInject';
  }

  $onInit() {
    this._initSettings();
    this.areNewSettings = !Object.keys(this.settings).length;
  }

  _initSettings() {
    if (!this.resolve) {
      this.settings = {};
    }
    this.settings = this.resolve.settings || {};
  }

  get passwordNotSet() {
    return this.areNewSettings && (!this.settings.password || !this.settings.password.length);
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    this.modalInstance.close(this.settings);
  }
}

export default AppPreferencesUserSettingsAddEdit;
