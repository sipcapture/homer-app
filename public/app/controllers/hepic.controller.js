class HepicController {
  constructor(CONFIGURATION) {
    'ngInject';
    this.CONFIGURATION = CONFIGURATION;
    this.title = this.CONFIGURATION.APP_NAME + ' ' + this.CONFIGURATION.VERSION;
  }

  $onInit() {
  }
}

export default HepicController;
