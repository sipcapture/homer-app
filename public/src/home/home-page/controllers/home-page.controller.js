class HomePage {

  constructor($log, AuthenticationService) {
    this.$log = $log;
    this.AuthenticationService = AuthenticationService;
  }

  logout() {
    this.AuthenticationService.logout().catch(this.$log.error);
  }
  
}

HomePage.$inject = ['$log', 'AuthenticationService'];
export default HomePage;
