class AddWidget {

  constructor() {}

  $onInit() {
    this.widgets = this.resolve.widgets;
  }

  dismiss() {
    this.modalInstance.dismiss();
  }
  
  addWidget(widget) {
    this.modalInstance.close(widget);
  }
  
}

export default AddWidget;
