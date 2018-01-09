class EventBus {

  constructor($rootScope) {
    this.$rootScope = $rootScope; 
  }

  subscribe(name, callback) {
    return this.$rootScope.$on(name, callback);
  }

  broadcast(name, data) {
    this.$rootScope.$emit(name, data);
  }
}

export default EventBus;
