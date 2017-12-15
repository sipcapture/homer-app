import data_headers from '../data/headers';
import data_headers_user_ext_cr from '../data/headers_user_ext_cr';

const injectParams = ['widget', '$uibModalInstance', 'CONFIGURATION'];
const QuicksearchWidgetSettingsCtrl = function(widget, $uibModalInstance, CONFIGURATION) {
  const self = this;

  self.widget = widget;

  self.headers = data_headers;
  if (CONFIGURATION.USER_EXT_CR) {
    self.headers = self.headers.concat(data_headers_user_ext_cr);
  }

  let counter = 0;

  self.dismiss = function() {
    $uibModalInstance.dismiss();
  };
  
  self.submit = function() {
    $uibModalInstance.close(self.widget);
  };

  self.addField = function () {
    self.widget.fields.push({ name: 'default' + counter });
  };
  
  self.removeField = function(index){
    self.widget.fields.splice(index, 1);
  };
  
};

QuicksearchWidgetSettingsCtrl.$inject = injectParams;
export default QuicksearchWidgetSettingsCtrl;
