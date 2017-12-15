
    /* CustomWidgetCtrl */
    var injectCustomWidgetsParams = ['$scope', '$uibModal'];    
    var customWidgetCtrl = function($scope, $uibModal) {

		$scope.remove = function(widget) {
			$scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
		};
		
		//console.log("OPEN");

		$scope.openSettings = function(widget) {
			$uibModal.open({
				scope: $scope,
				templateUrl: 'templates/widget_settings.html',
				controller: 'WidgetSettingsCtrl',
				resolve: {
					widget: function() {
						return widget;
					}
				}
			});
		};

    };
   
    customWidgetCtrl.$inject = injectCustomWidgetsParams;
export default customWidgetCtrl;
