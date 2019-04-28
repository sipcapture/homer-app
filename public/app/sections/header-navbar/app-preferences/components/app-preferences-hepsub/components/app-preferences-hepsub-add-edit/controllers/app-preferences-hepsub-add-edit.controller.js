class AppPreferencesHepSubAddEdit {
  constructor(log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesHepSubAddEdit');
    this.aceOptions = {
      mode: 'json',
      useWrapMode: true,
      showGutter: false,
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
    this._initHepSub();
    this.isNewHepSub = !Object.keys(this.hepsub).length;
  }

  _initHepSub() {
    if (!this.resolve) {
      this.hepsub = {};
    }
    this.hepsub = this.resolve.hepsub || {};
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    this.modalInstance.close(this.hepsub);
  }
}

export default AppPreferencesHepSubAddEdit;
