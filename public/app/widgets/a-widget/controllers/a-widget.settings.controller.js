import '../style/a-widget.settings.css';

const injectParams = ['widget', 'some_static_data', '$uibModalInstance'];
const AWidgetSettingsCtrl = function(widget, some_static_data, $uibModalInstance) {
  const self = this;

  self.widget = widget;
  self.some_static_data = some_static_data;

  /*
  * Quit widget editing
  */
  self.dismiss = function() {
    $uibModalInstance.dismiss();
  };

  /*
  * Submit widget data
  * @return {object} widget
  */
  self.submit = function() {
    $uibModalInstance.close(self.widget);
  };
};

AWidgetSettingsCtrl.$inject = injectParams;
export default AWidgetSettingsCtrl;
