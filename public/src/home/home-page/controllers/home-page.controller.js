class HomePage {

  constructor($log, $state) {
    'ngInject';
    this.$log = $log;
    this.$state = $state;
  }

  logout() {
    this.$state.go('login');
  }
  
}

export default HomePage;
