class AppPreferencesMappingAddEdit {
  constructor(log) {
    'ngInject';

    window.define = window.define || ace.define;    
    this.log = log;
    this.log.initLocation('AppPreferencesMappingAddEdit');
    this.aceOptions = {
      mode: 'json',
      theme: 'dreamweaver',
      rendererOptions: {
        maxLines: 32,
        minLines: 5,
      },
      editorOptions: {
        autoScrollEditorIntoView: true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
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
