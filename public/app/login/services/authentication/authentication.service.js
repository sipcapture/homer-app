class AuthenticationService {

  constructor($rootScope, $state, $http, $localStorage, ROUTER) {
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$http = $http;
    this.$localStorage = $localStorage;
    this.ROUTER = ROUTER;
  }

  login(username, password) {
    return this.$http.post('/api/v3/auth', { username, password }).then((response) => {
      const data = response.data;
      if (!data.token) {
        throw new Error('something went wrong, no JWT token received');
      }

      this.$localStorage.user = {
        username,
        token: data.token
      };

      this.$http.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      return null;
    });
  }

  logout() {
    return this.$state.go(this.ROUTER.LOGIN.NAME);
  }
}

export default AuthenticationService;
