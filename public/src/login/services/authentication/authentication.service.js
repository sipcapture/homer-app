import Promise from 'bluebird';

class AuthenticationService {

  constructor($state, $http, $localStorage) {
    this.$state = $state;
    this.$http = $http;
    this.$localStorage = $localStorage;
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
    return new Promise((resolve) => {
      delete this.$localStorage.user;
      this.$http.defaults.headers.common.Authorization = '';
      this.$state.go('login');
      resolve(null);
    });
  }
}

export default AuthenticationService;
