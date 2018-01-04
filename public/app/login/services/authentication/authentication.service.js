class AuthenticationService {

  constructor($rootScope, $state, $http, $localStorage, ROUTER, API) {
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$http = $http;
    this.$localStorage = $localStorage;
    this.ROUTER = ROUTER;
    this.API = API;
  }

  login(username, password) {
    return this.$http.post(this.API.AUTH, { username, password }).then((response) => {
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
