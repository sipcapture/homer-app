    var injectafterRenderParams = ['$window','$timeout'];
    var hepicafterRenderDirective = function ($window, $timeout) {
		return {
                    restrict : 'A',
                    terminal : true,
                    transclude : false,
                    link: function(scope, element, attrs) {
                        var combineHeights, siblings;
                        if (attrs) { scope.$eval(attrs.afterRender) }
                        scope.$emit('onAfterRender')
                    }
                };
    };

    hepicafterRenderDirective.$inject = injectafterRenderParams;
export default hepicafterRenderDirective;
