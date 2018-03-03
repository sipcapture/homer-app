import uuid from 'uuid/v4';

class AddWidget {
  constructor() {}

  $onInit() {
    this.widgets = this.resolve.widgets;
  }

  dismiss() {
    this.modalInstance.dismiss();
  }
  
  addWidget(widget) {
    widget.uuid = uuid();
    this.modalInstance.close(widget);
  }
}

export default AddWidget;
