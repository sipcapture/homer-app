import '../style/rsearch-widget.settings.css';

class RsearchWidgetSettings {
  constructor() {
    'ngInject';
  }

  $onInit() {
    this.digitalRsearch = false;
    this.widget = this.resolve.widget;
    this.timezones = this.resolve.timezones;
  }

  get locationName() {
    return this.widget.config.location.desc || 'unknown';
  }

  setTimezone(zone) {
    this.widget.config.location = zone;
  }

  dismiss() {
    this.modalInstance.dismiss();
  }
  
  submit() {
    this.modalInstance.close(this.widget);
  }
}

export default RsearchWidgetSettings;
