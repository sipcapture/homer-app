class AppPreferencesMappingAddEdit {
  constructor(log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesMappingAddEdit');
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
    this._initMapping();
    this.isNewMapping = !Object.keys(this.mapping).length;
  }

  _initMapping() {
    if (!this.resolve) {
      this.mapping = {};
    }
    this.mapping = this.resolve.mapping || {};
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    this.modalInstance.close(this.mapping);
  }
}

export default AppPreferencesMappingAddEdit;
