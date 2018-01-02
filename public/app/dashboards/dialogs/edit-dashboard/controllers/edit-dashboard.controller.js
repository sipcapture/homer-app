import {includes} from 'lodash';

class EditDashboard {

  constructor() {}

  $onInit() {
    this.dashboard = this.resolve.dashboard;

    if (!this.dashboard.type) {
      this.dashboard.type = 'custom';
    }

    this.dashboard.user = this.dashboard.shared;
    this.sharedDisabled = false;

    this.types = [
      { value:'custom', name:'Custom'},
      { value:'frame', name:'Frame'},
      { value:'home', name:'HOME'},
      { value:'search', name:'SEARCH'},
      { value:'alarm', name:'ALARM'}
    ];

    if (includes(['home', 'search', 'alarm'], this.dashboard.alias)) {
      this.dashboard.type = this.dashboard.alias;
      this.sharedDisabled = true;
    } else if (this.dashboard.type == 1) {
      this.dashboard.type = 'frame';
    } else {
      this.dashboard.type = 'custom';
    }
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  hitEnter(event) {
    if (event.keyCode === 13) {
      this.save();
    }
  }
  
  save() {
    if (this.dashboard.name.length) {
      this.modalInstance.close(this.dashboard);
    }
  }
  
  
}

export default EditDashboard;
