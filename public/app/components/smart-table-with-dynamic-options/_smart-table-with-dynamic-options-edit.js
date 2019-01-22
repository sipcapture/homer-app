import { cloneDeep, get } from 'lodash';

export default class SmartTableWithDynamicOptionsEdit {
  $onInit() {
    this.row = cloneDeep(get(this, 'resolve.row')) || {};
  }

  dismiss() {
    this.modalInstance.dismiss();
  }

  submit() {
    this.modalInstance.close(this.row);
  }
}
