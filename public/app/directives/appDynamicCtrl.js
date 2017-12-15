    var injectParams = ['$compile', '$parse'];

    var appDynamicCtrDirective = function ($compile, $parse) {
		return {
			restrict: 'A',
			terminal: true,
			priority: 100000,
			link: function(scope, elem) {
			        //console.log(elem);
				var name = $parse(elem.attr('dynamic-ctrl'))(scope);
				//console.log(name);
				elem.removeAttr('dynamic-ctrl');
				elem.attr('ng-controller', name);
				$compile(elem)(scope);
			}
		};
    };

    appDynamicCtrDirective.$inject = injectParams;

export default appDynamicCtrDirective;
