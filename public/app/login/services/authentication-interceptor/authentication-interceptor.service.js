let self = null; // it is necessary because interceptor looses context when invoked: https://stackoverflow.com/a/34163273/2393924

class AuthenticationInterceptor {

  constructor($state, $log, ROUTER) {
    this.$state = $state;
    this.$log = $log;
    this.ROUTER = ROUTER;
    self = this;
  }

  responseError(rejection) {
    return self.$state.go(self.ROUTER.LOGIN.NAME).then(() => {
      self.$log.warn('[AuthenticationInterceptor]', rejection.data.error, rejection.data.message);
    });
  }
}

export default AuthenticationInterceptor;
