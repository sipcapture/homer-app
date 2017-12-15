    var hepicSwitchDirective = function () {
                
                return {
              	  	restrict: 'A',
               		require: '?ngModel',
                	link: function(scope, element, attrs, ngModel) {
                    		element.bootstrapSwitch();

                    		element.on('switchChange.bootstrapSwitch', function(event, state) {
                        		if (ngModel) {
                            			scope.$apply(function() {
                                		ngModel.$setViewValue(state);
                            			});
                        		}
                    		});

                    		scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                        		if (newValue) {
                            			element.bootstrapSwitch('state', true, true);
                        		} else {
                            			element.bootstrapSwitch('state', false, true);
                        		}
                    		});
                	}
            	};
        
    };

export default hepicSwitchDirective;
