class AppPreferencesAdvancedAddEdit {
  constructor(log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesAdvancedAddEdit');
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
    this._initAdvanced();
    this.isNewAdvanced = !Object.keys(this.advanced).length;
  }

  _initAdvanced() {
    if (!this.resolve) {
      this.advanced = {};
    }
    this.advanced = this.resolve.advanced || {};
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    this.modalInstance.close(this.advanced);
  }
}

export default AppPreferencesAdvancedAddEdit;
