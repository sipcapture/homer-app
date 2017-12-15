import { includes } from 'lodash';

const injectEditDashboardParams = ['dashboard', '$uibModalInstance'];
const EditDashboardController = function (dashboard, $uibModalInstance) {

  const self = this;

  self.dashboard = dashboard;

  if (!self.dashboard.type) {
    self.dashboard.type = 'custom';
  }

  self.dashboard.user = self.dashboard.shared;
  self.sharedDisabled = false;

  self.types = [
    { value:'custom', name:'Custom'},
    { value:'frame', name:'Frame'},
    { value:'home', name:'HOME'},
    { value:'search', name:'SEARCH'},
    { value:'alarm', name:'ALARM'}
  ];

  if (includes(['home', 'search', 'alarm'], self.dashboard.alias)) {
    self.dashboard.type = self.dashboard.alias;
    self.sharedDisabled = true;
  } else if (self.dashboard.type == 1) {
    self.dashboard.type = 'frame';
  } else {
    self.dashboard.type = 'custom';
  }

  self.hitEnter = function (event) {
    console.log('event', event);
    if (event.keyCode === 13) {
      self.save();
    }
  };

  self.dismiss = function () {
    $uibModalInstance.dismiss();
  };
  
  self.save = function () {
    if (self.dashboard.name.length) {
      $uibModalInstance.close(self.dashboard);
    }
  };

};

EditDashboardController.$inject = injectEditDashboardParams;
export default EditDashboardController;
