const injectNewWidgetDashboardParams = [
  'widgets',
  '$uibModalInstance'
];

const NewWidgetDashboardController = function(widgets, $uibModalInstance) {
  const self = this;
  self.widgets = widgets;

  self.dismiss = function () {
    $uibModalInstance.dismiss();
  };
  
  self.addWidget = function (widget) {
    $uibModalInstance.close(widget);
  };
};

NewWidgetDashboardController.$inject = injectNewWidgetDashboardParams;
export default NewWidgetDashboardController;
