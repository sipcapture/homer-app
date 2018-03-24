class AuthenticationService {
  constructor($log, $rootScope, $state, $http, $localStorage, ROUTER, API) {
    this.$log = $log;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$http = $http;
    this.$localStorage = $localStorage;
    this.ROUTER = ROUTER;
    this.API = API;
  }

  async login(username, password) {
    try {
      const response = await this.$http.post(this.API.AUTH, {username, password});
      const data = response.data;
      if (!data.token) {
        throw new Error('something went wrong, no JWT token received');
      }

      this.$localStorage.user = {
        username,
        token: data.token,
      };

      this.$http.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      return response;
    } catch (err) {
      throw err;
    }
  }

  logout() {
    return this.$state.go(this.ROUTER.LOGIN.NAME);
  }
}

export default AuthenticationService;
