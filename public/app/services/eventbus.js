var eventFactory = function ($rootScope) {
  var factory = {};
  
  factory.subscribe = function (eventName, callback) {
    return $rootScope.$on(eventName, callback);
  };
  
  factory.broadcast = function (eventName, data) {
    $rootScope.$emit(eventName, data);
  };
                                       
  return factory;
};

var injectParams = ['$rootScope'];
eventFactory.$inject = injectParams;
export default eventFactory;
