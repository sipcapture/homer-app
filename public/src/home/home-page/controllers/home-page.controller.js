class HomePage {

  constructor($log, $state) {
    this.$log = $log;
    this.$state = $state;
  }

  logout() {
    this.$state.go('login');
  }
  
}

HomePage.$inject = ['$log', '$state'];
export default HomePage;
