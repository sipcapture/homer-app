let self = null; // it is necessary because interceptor looses context when invoked: https://stackoverflow.com/a/34163273/2393924

class RequestResponseInterceptor {
  constructor($state, $log, ROUTER) {
    this.$state = $state;
    this.$log = $log;
    this.ROUTER = ROUTER;
    self = this;
  }

  request(request) {
    self.$log.debug(['RequestResponseInterceptor'], ['request'], request);
    return request;
  }

  requestError(request) {
    self.$log.error(['RequestResponseInterceptor'], ['requestError'], request);
    return request;
  }

  response(response) {
    self.$log.debug(['RequestResponseInterceptor'], ['reponse'], response);
    return response;
  }

  responseError(rejection) {
    if (rejection.status === 403) {
      self.$log.error(['RequestResponseInterceptor'], ['reponseError'], rejection.data.error, rejection.data.message);
      return self.$state.go(self.ROUTER.LOGIN.NAME);
    }
    self.$log.error(['RequestResponseInterceptor'], ['reponseError'], rejection);
  }
}

export default RequestResponseInterceptor;
