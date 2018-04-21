import {has} from 'lodash';

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
      const resp = await this.$http.post(this.API.AUTH, {username, password});
      if (!has(resp, 'data.token') || !resp.data.token.length) {
        throw new Error('something went wrong, no JWT token received, probably wrong credentials used to login');
      }

      this.$localStorage.user = {
        username,
        token: resp.data.token,
      };

      this.$http.defaults.headers.common.Authorization = `Bearer ${resp.data.token}`;
      return resp;
    } catch (err) {
      throw err;
    }
  }

  currentUser() {
    return this.$localStorage.user;
  }

  logout() {
    return this.$state.go(this.ROUTER.LOGIN.NAME);
  }
}

export default AuthenticationService;
