/* global window, Event */
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

  resizeNull() {
    setTimeout(function() {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }

  refreshChart() {
    setTimeout(function() {
      this.$rootScope.$broadcast('highchartsng.reflow');
    }, 30);
  }
}

export default EventBus;
