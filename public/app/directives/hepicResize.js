    var injectResizeParams = ['$window'];
    var hepicResizeDirective = function ($window) {
    
                return function (scope, element, attr) {
                
                        var w = angular.element($window);

                        scope.getWindowDimensions = function () {
                                return { 'h': w.height(), 'w': w.width() };
                        };

                        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                                // resize Grid to optimize height
                                $('.gridStyle').height(newValue.h - 180);
                        }, true);

                        w.bind('resize', function () {

                                scope.$apply();
                        });
                };
    };

    hepicResizeDirective.$inject = injectResizeParams;
export default hepicResizeDirective;
