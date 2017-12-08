const loginUser  = function($location, $state, $log, AuthenticationService) {
  const self = this;

  self.$onInit = function() {
    self.username = null;
    self.password = null;
    AuthenticationService.logout();
  };
  
  self.login = function() {
    self.loading = true;
    AuthenticationService.login(self.username, self.password).then(function() {
      $state.go('home');
      //$location.path('/');
    }).catch(function(error) {
      self.error = error;
      self.loading = false;
      $log.error(error);
    });
  };
};

loginUser.$inject = ['$location', '$state', '$log', 'AuthenticationService'];
export default loginUser;
