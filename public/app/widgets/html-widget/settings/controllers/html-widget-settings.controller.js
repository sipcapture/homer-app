class HtmlWidgetSettings {
  constructor() {
    'ngInject';
  }

  $onInit() {
    this.widget = this.resolve.widget;
  }

  get locationName() {
    return this.widget.config.content || '<p>No Content</p>';
  }

  dismiss() {
    this.modalInstance.dismiss();
  }
  
  submit() {
    this.modalInstance.close(this.widget);
  }
}

export default HtmlWidgetSettings;
