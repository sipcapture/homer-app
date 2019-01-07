import '../style/rsearch-widget.settings.css';

class RsearchWidgetSettings {
  constructor() {
    'ngInject';
  }

  $onInit() {
    this.digitalRsearch = false;
    this.widget = this.resolve.widget;
  }

  get locationName() {
    return this.widget.config.location.desc || 'unknown';
  }

  dismiss() {
    this.modalInstance.dismiss();
  }
  
  submit() {
    this.modalInstance.close(this.widget);
  }
}

export default RsearchWidgetSettings;
