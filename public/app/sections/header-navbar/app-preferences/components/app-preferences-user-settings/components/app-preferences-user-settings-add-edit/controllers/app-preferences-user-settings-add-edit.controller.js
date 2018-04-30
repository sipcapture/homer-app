class AppPreferencesUserSettingsAddEdit {
  constructor(log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesUserSettingsAddEdit');
    this.aceOptions = {
      mode: 'json',
      useWrapMode: true,
      showGutter: true,
      rendererOptions: {
        maxLines: 32,
        minLines: 5,
      },
      editorOptions: {
        autoScrollEditorIntoView: false,
      },
    };
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

    try {
      this.data = JSON.stringify(this.settings.data, null, 2);
    } catch (err) {
      this.log.error(`fail to stringify settings data: ${err.message}`);
    }
  }

  get passwordNotSet() {
    return this.areNewSettings && (!this.settings.password || !this.settings.password.length);
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    try {
      this.settings.data = JSON.parse(this.data);
    } catch (err) {
      this.log.error(`fail to parse settings data: ${err.message}`);
    }
    this.modalInstance.close(this.settings);
  }
}

export default AppPreferencesUserSettingsAddEdit;
