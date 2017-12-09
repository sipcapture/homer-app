class LoginUser {

  constructor($state, $log, $location, AuthenticationService) {
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
      this.$state.go('home');
    }).catch((error) => {
      this.error = error;
      this.loading = false;
      this.$log.error(error);
    });
  }

}

LoginUser.$inject = ['$state', '$log', '$location', 'AuthenticationService'];
export default LoginUser;
