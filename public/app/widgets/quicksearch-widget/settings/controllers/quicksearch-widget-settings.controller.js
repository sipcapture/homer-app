import data_headers from '../data/headers';
import data_headers_user_ext_cr from '../data/headers_user_ext_cr';

class QuicksearchWidgetSettings {
  
  constructor(CONFIGURATION) {
    'ngInject';
    this.CONFIGURATION = CONFIGURATION;
  }

  $onInit() {
    this.counter = 0;
    this.widget = this.resolve.widget;
    this.headers = data_headers;

    if (this.CONFIGURATION.USER_EXT_CR) {
      this.headers = this.headers.concat(data_headers_user_ext_cr);
    }
  }

  dismiss() {
    this.modalInstance.dismiss();
  }
  
  submit() {
    this.modalInstance.close(this.widget);
  }

  addField() {
    this.widget.fields.push({ name: 'default' + this.counter });
  }
  
  removeField(index){
    this.widget.fields.splice(index, 1);
  }
}

export default QuicksearchWidgetSettings;
