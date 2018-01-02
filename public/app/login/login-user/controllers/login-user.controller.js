class LoginUser {

  constructor($rootScope, $state, $log, $location, AuthenticationService, ROUTER) {
    'ngInject';
    this.$rootScope = $rootScope;
    this.ROUTER = ROUTER;
    this.$log = $log;
    this.username = null;
    this.password = null;
    this.$state = $state;
    this.$location = $location;
    this.AuthenticationService = AuthenticationService;
  }

  $onInit() {
    this.AuthenticationService.logout().catch((error) => {
      this.error = error;
      this.loading = false;
      this.$log.error(error);
    });
  }
  
  login() {
    this.loading = true;
    this.AuthenticationService.login(this.username, this.password).then(() => {
      this.$rootScope.authenticated = true;
      this.$state.go(this.ROUTER.DASHBOARD.NAME, { boardID: this.ROUTER.HOME.NAME });
    }).catch((error) => {
      this.$rootScope.authenticated = false;
      this.error = error;
      this.loading = false;
      this.$log.error(error);
    });
  }

}

export default LoginUser;
