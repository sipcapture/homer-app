class LoginUser {

  constructor($state, $log, AuthenticationService) {
    this.username = null;
    this.password = null;
    this.$state = $state;
    this.AuthenticationService = AuthenticationService;
  }

  $onInit() {
    this.AuthenticationService.logout();
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

LoginUser.$inject = ['$state', '$log', 'AuthenticationService'];
export default LoginUser;
