import dataHeaders from '../data/headers';
import dataHeadersUserExtCr from '../data/headers_user_ext_cr';

class ProtosearchWidgetSettings {
  constructor(CONFIGURATION) {
    'ngInject';
    this.CONFIGURATION = CONFIGURATION;
  }

  $onInit() {
    this.counter = 0;
    this.widget = this.resolve.widget;
    this.headers = dataHeaders;

    if (this.CONFIGURATION.USER_EXT_CR) {
      this.headers = this.headers.concat(dataHeadersUserExtCr);
    }
  }

  dismiss() {
    this.modalInstance.dismiss();
  }
  
  submit() {
    this.modalInstance.close(this.widget);
  }

  addField() {
    this.widget.fields.push({name: 'default' + this.counter});
  }
  
  removeField(index) {
    this.widget.fields.splice(index, 1);
  }
}

export default ProtosearchWidgetSettings;
