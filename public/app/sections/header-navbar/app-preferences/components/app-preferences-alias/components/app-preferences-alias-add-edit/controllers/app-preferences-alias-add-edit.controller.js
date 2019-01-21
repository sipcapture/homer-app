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

    try {
      this.data = JSON.stringify(this.Alias.data, null, 2);
    } catch (err) {
      this.log.error(`fail to stringify Alias data: ${err.message}`);
    }
  }

  get passwordNotSet() {
    return this.areNewAlias && (!this.Alias.password || !this.Alias.password.length);
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    try {
      this.Alias.data = JSON.parse(this.data);
    } catch (err) {
      this.log.error(`fail to parse Alias data: ${err.message}`);
    }
    this.modalInstance.close(this.Alias);
  }
}

export default AppPreferencesAliasAddEdit;
