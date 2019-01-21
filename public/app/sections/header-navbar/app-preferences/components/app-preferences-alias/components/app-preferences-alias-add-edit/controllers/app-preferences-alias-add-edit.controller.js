class AppPreferencesAliasAddEdit {
  constructor(log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesAliasAddEdit');
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
    this._initAlias();
    this.areNewAlias = !Object.keys(this.Alias).length;
  }

  _initAlias() {
    if (!this.resolve) {
      this.Alias = {};
    }
    this.Alias = this.resolve.Alias || {};
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    this.modalInstance.close(this.Alias);
  }
}

export default AppPreferencesAliasAddEdit;
