    var injectWidgetSettingsParams = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget'];    
    var WidgetSettingsCtrl = function($scope, $timeout, $rootScope, $uibModalInstance, widget) {

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
	};
    
    
        WidgetSettingsCtrl.$inject = injectWidgetSettingsParams;
export default WidgetSettingsCtrl;                         
