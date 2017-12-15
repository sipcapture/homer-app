
    /* EDIT Interception */
    var injectSettingsAdminInterceptionEditParams = ['$scope','$state','$uibModalInstance','interceptiondata'];
    var SettingsAdminInterceptionEditController = function ($scope, $state, $uibModalInstance, interceptiondata) {
         
		$scope.interception = angular.copy(interceptiondata);
		
		$scope.passwordNotSet = false;			

		$scope.toggleMin = function() {
			$scope.minDate = $scope.minDate ? null : new Date();
			$scope.maxDate = $scope.maxDate ? null : new Date().setFullYear(2033, 0, 1);
	        };

        	$scope.toggleMin();

		$scope.modelDateP = {};
		      		
        	$scope.dateOptions = {
	            formatYear: "yy",
	            startingDay: 1,
        	    showWeeks: false
	        };

        	$scope.formatDate = "yyyy-MM-dd HH:mm";
        	        
		$scope.openCalendar = function($event, opened) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.modelDateP[opened] = !$scope.modelDateP[opened];
		};
		
		$scope.dismiss = function() {
			$uibModalInstance.dismiss();
		};

		$scope.remove = function() {
			console.log("DONE REMOVE");
			$uibModalInstance.close();
		};

	        $scope.save = function() {
	        	        
	            if($scope.myForm.$dirty && !$scope.myForm.$invalid) {
			angular.extend(interceptiondata, $scope.interception);
			$uibModalInstance.close(interceptiondata);
                    }
		};
    };

    SettingsAdminInterceptionEditController.$inject = injectSettingsAdminInterceptionEditParams;
export default SettingsAdminInterceptionEditController;
