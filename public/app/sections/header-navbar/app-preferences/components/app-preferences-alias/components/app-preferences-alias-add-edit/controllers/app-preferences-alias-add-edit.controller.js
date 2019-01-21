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
    this.isNewAlias = !Object.keys(this.alias).length;
  }

  _initAlias() {
    if (!this.resolve) {
      this.alias = {};
    }
    this.alias = this.resolve.alias || {};
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    this.modalInstance.close(this.alias);
  }
}

export default AppPreferencesAliasAddEdit;
