class HepicController {

  constructor($rootScope, $scope) {
    'ngInject';
    this.$rootScope = $rootScope;
    this.$scope = $scope;
  }

  $onInit() {
    this.$rootScope.$watch('authenticated', (authenticated) => {
      this.authenticated = authenticated;
    });
  }
}

export default HepicController;
