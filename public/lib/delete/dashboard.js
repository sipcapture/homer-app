angular.module('dashboard', [''])

.controller('dashboardCtrl', ['$scope', '$timeout','$q','$rootScope',
    function($scope, $timeout, $q, $rootScope) {

		$scope.gridsterOptions = {
			margins: [20, 20],
			columns: 4,
			draggable: {
				handle: 'h3'
			}
		};

		$scope.dashboards = {
			'1': {
				id: '1',
				name: 'Home',
				widgets: [{
					col: 0,
					row: 0,
					sizeY: 1,
					sizeX: 1,
					name: "Widget 1"
				}, {
					col: 2,
					row: 1,
					sizeY: 1,
					sizeX: 1,
					name: "Widget 2"
				}]
			},
			'2': {
				id: '2',
				name: 'Other',
				widgets: [{
					col: 1,
					row: 1,
					sizeY: 1,
					sizeX: 2,
					name: "Other Widget 1"
				}, {
					col: 1,
					row: 3,
					sizeY: 1,
					sizeX: 1,
					name: "Other Widget 2"
				}]
			}
		};

		$scope.clear = function() {
			$scope.dashboard.widgets = [];
		};

		$scope.addWidget = function(type) {
		        if(type == 1) 
		        {
		                console.log("CLOCK");
		                //var route = routeResolverProvider.route;
				//route.resolve('dashboard');
				var reF = resolve("a","b", 0);
		        }
		        else {
        			$scope.dashboard.widgets.push({
	        			name: "New Widget",
		        		sizeX: 1,
			        	sizeY: 1
        			});
			}
			
                        console.log($scope.dashboard);
		};

		$scope.$watch('selectedDashboardId', function(newVal, oldVal) {
			if (newVal !== oldVal) {
				$scope.dashboard = $scope.dashboards[newVal];
			} else {
				$scope.dashboard = $scope.dashboards[1];
			}
		});

		// init dashboard
		$scope.selectedDashboardId = '1';
		
	
		/*resolve*/		
		var resolve = function (baseName, path, secure) {
                	if (!path) path = '';
	                var routeDef = {};
        	        routeDef.templateUrl = "view/" + path + baseName + '.html';
                	routeDef.controller = baseName + 'Controller';
	                routeDef.secure = (secure) ? secure : false;
	                console.log(baseName);

			var dependencies = ['widgets/clock/clock.js'];

			var defer = $q.defer()
                        console.log("b");
                        require(dependencies, function () {
                          	defer.resolve();
                                $rootScope.$apply()
                        });

                        return defer.promise;

	                /*
	                
        	        routeDef.resolve = {
                	    load: ['$q', '$rootScope', function ($q, $rootScope) {
                	            console.log("B");
                        	var dependencies = ["test" + path + baseName + 'Controller.js'];
	                        return resolveDependencies($q, $rootScope, dependencies);
        	            }]
                	};
			*/
	                return routeDef;
        	};

	        var resolveDependencies = function ($q, $rootScope, dependencies) {

			var defer = $q.defer()
			console.log("b");
	                require(dependencies, function () {
        		            defer.resolve();
	                	    $rootScope.$apply()
	        	});

        	        return defer.promise;
                };

    }
])    
.controller('CustomWidgetCtrl', ['$scope', '$uibModal',
        function($scope, $uibModal) {

		$scope.remove = function(widget) {
			$scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
		};

		$scope.openSettings = function(widget) {
			$uibModal.open({
				scope: $scope,
				templateUrl: 'widgets/clock/edit.html',
				controller: 'WidgetSettingsCtrl',
				resolve: {
					widget: function() {
						return widget;
					}
				}
			});
		};

        }   
])
.controller('WidgetSettingsCtrl', ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget',
        function($scope, $timeout, $rootScope, $uibModalInstance, widget) {

		$scope.widget = widget;

		$scope.form = {
			name: widget.name,
			sizeX: widget.sizeX,
			sizeY: widget.sizeY,
			col: widget.col,
			row: widget.row
		};

		$scope.sizeOptions = [{
			id: '1',
			name: '1'
		}, {
			id: '2',
			name: '2'
		}, {
			id: '3',
			name: '3'
		}, {
			id: '4',
			name: '4'
		}];

		$scope.dismiss = function() {
			$uibModalInstance.dismiss();
		};

		$scope.remove = function() {
			$scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
			$uibModalInstance.close();
		};

		$scope.submit = function() {
			angular.extend(widget, $scope.form);

			$uibModalInstance.close(widget);
		};
	} 
])
.filter('object2Array', function() {
        return function(input) {
                var out = [];
                for (i in input) {
                        out.push(input[i]);
                }
                return out;
        }
});
